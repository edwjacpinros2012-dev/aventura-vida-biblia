import { randomBytes } from "node:crypto";
import { Prisma, type MatchPlayerStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { applyAdventureCoinChange } from "@/lib/economy/service";
import { isBlocked } from "@/lib/community/service";
import type { MultiplayerError, PublicPlayerIdentity, PvpDuelSnapshot } from "@/lib/multiplayer/contracts";
import { duelQuestionFor } from "./pvp-questions";

const TOTAL_ROUNDS = 3;
const RECONNECT_GRACE_MS = 30_000;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type DuelPlayer = PublicPlayerIdentity & {
  accountId?: string;
  status: "CONNECTED" | "DISCONNECTED" | "LEFT";
  score: number;
};

type InternalDuel = {
  id: string;
  code: string;
  seed: number;
  status: PvpDuelSnapshot["status"];
  revision: number;
  round: number;
  players: DuelPlayer[];
  answers: Record<string, number>;
  continued: string[];
  lastRound?: PvpDuelSnapshot["lastRound"];
  result?: PvpDuelSnapshot["result"];
  disconnectDeadline?: string;
  createdAt: string;
  rewarded: boolean;
};

export class PvpServiceError extends Error {
  constructor(public readonly code: MultiplayerError["code"], message: string) { super(message); }
}

function playerStatus(status: DuelPlayer["status"]): MatchPlayerStatus {
  return status === "CONNECTED" ? "ACTIVE" : status === "DISCONNECTED" ? "DISCONNECTED" : "LEFT";
}

function code() {
  return Array.from(randomBytes(6), (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join("");
}

function id() { return `pvp_${randomBytes(12).toString("hex")}`; }

function snapshot(match: InternalDuel): PvpDuelSnapshot {
  const question = match.status === "PLAYING" ? duelQuestionFor(match.seed, match.round) : undefined;
  return {
    id: match.id,
    code: match.code,
    status: match.status,
    revision: match.revision,
    round: match.round,
    totalRounds: TOTAL_ROUNDS,
    question: question ? { id: question.id, prompt: question.prompt, options: question.options, category: question.category } : undefined,
    players: match.players.map((player) => ({ id: player.id, nickname: player.nickname, avatar: player.avatar, score: player.score, status: player.status, answered: player.id in match.answers })),
    lastRound: match.lastRound,
    result: match.result,
    disconnectDeadline: match.disconnectDeadline,
  };
}

export class PvpDuelService {
  private readonly matches = new Map<string, InternalDuel>();
  private readonly queue: DuelPlayer[] = [];
  private readonly disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly persistenceEnabled = Boolean(process.env.DATABASE_URL);

  constructor(private readonly onStateChange?: (match: PvpDuelSnapshot) => void | Promise<void>) {}

  private async persist(match: InternalDuel) {
    if (!this.persistenceEnabled) return;
    const state = {
      seed: match.seed,
      round: match.round,
      revision: match.revision,
      status: match.status,
      lastRound: match.lastRound,
      disconnectDeadline: match.disconnectDeadline,
    } as Prisma.InputJsonValue;
    const databaseMatch = await prisma.match.upsert({
      where: { id: match.id },
      update: {
        pvpCode: match.code,
        mode: "PVP",
        status: match.status === "PLAYING" || match.status === "ROUND_RESULT" ? "ACTIVE" : match.status === "FINISHED" ? "FINISHED" : "ABANDONED",
        state,
        result: (match.result ?? undefined) as Prisma.InputJsonValue | undefined,
        startedAt: match.status === "PLAYING" || match.status === "ROUND_RESULT" || match.status === "FINISHED" ? new Date(match.createdAt) : undefined,
        endedAt: match.status === "FINISHED" || match.status === "ABANDONED" ? new Date() : undefined,
      },
      create: {
        id: match.id,
        pvpCode: match.code,
        gameKey: "bible-quiz-duel",
        mode: "PVP",
        status: match.status === "PLAYING" || match.status === "ROUND_RESULT" ? "ACTIVE" : match.status === "FINISHED" ? "FINISHED" : "WAITING",
        state,
        result: (match.result ?? undefined) as Prisma.InputJsonValue | undefined,
        startedAt: match.status === "PLAYING" || match.status === "ROUND_RESULT" ? new Date(match.createdAt) : null,
        endedAt: match.status === "FINISHED" || match.status === "ABANDONED" ? new Date() : null,
      },
    });
    await Promise.all(match.players.map((player) => prisma.matchPlayer.upsert({
      where: { matchId_playerKey: { matchId: databaseMatch.id, playerKey: player.id } },
      update: { userId: player.accountId, score: player.score, status: playerStatus(player.status), state: { answered: player.id in match.answers } as Prisma.InputJsonValue, leftAt: player.status === "LEFT" ? new Date() : null },
      create: { matchId: databaseMatch.id, playerKey: player.id, userId: player.accountId, score: player.score, status: playerStatus(player.status), state: { answered: player.id in match.answers } as Prisma.InputJsonValue, leftAt: player.status === "LEFT" ? new Date() : null },
    })));
  }

  private async reward(match: InternalDuel) {
    if (!this.persistenceEnabled || match.rewarded || match.status !== "FINISHED") return;
    match.rewarded = true;
    const winner = match.result?.winnerId;
    const accounts = match.players.filter((player): player is DuelPlayer & { accountId: string } => Boolean(player.accountId));
    try {
      await prisma.$transaction(async (tx) => {
        const saved = await tx.match.findUnique({ where: { id: match.id }, select: { result: true } });
        if (saved?.result && typeof saved.result === "object" && "rewardsApplied" in saved.result) return;
        for (const player of accounts) {
          const outcome = winner ? (player.id === winner ? "WIN" : "LOSS") : "DRAW";
          const ratingChange = outcome === "WIN" ? 24 : outcome === "LOSS" ? -12 : 6;
          const xp = outcome === "WIN" ? 70 : outcome === "DRAW" ? 45 : 25;
          const points = outcome === "WIN" ? 60 : outcome === "DRAW" ? 35 : 15;
          await tx.pvpProfile.upsert({
            where: { userId: player.accountId },
            create: { userId: player.accountId, rating: 1000 + ratingChange, wins: outcome === "WIN" ? 1 : 0, losses: outcome === "LOSS" ? 1 : 0, draws: outcome === "DRAW" ? 1 : 0, gamesPlayed: 1 },
            update: { rating: { increment: ratingChange }, wins: { increment: outcome === "WIN" ? 1 : 0 }, losses: { increment: outcome === "LOSS" ? 1 : 0 }, draws: { increment: outcome === "DRAW" ? 1 : 0 }, gamesPlayed: { increment: 1 } },
          });
          await tx.profile.update({ where: { userId: player.accountId }, data: { totalXp: { increment: xp }, points: { increment: points } } });
          await applyAdventureCoinChange(tx, {
            userId: player.accountId,
            amount: outcome === "WIN" ? 30 : outcome === "DRAW" ? 20 : 10,
            reason: "PVP_DUEL",
            sourceId: match.id,
            idempotencyKey: `pvp:${match.id}:${player.accountId}`,
          });
        }
        await tx.match.update({ where: { id: match.id }, data: { result: { ...(match.result ?? {}), rewardsApplied: true } as Prisma.InputJsonValue, endedAt: new Date(), status: "FINISHED" } });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      match.rewarded = false;
      console.error("No se pudieron persistir las recompensas PvP", error);
    }
  }

  private async save(match: InternalDuel) {
    try { await this.persist(match); await this.reward(match); await this.onStateChange?.(snapshot(match)); }
    catch (error) { console.error("No se pudo persistir el duelo", error); }
  }

  async queuePlayer(player: PublicPlayerIdentity, accountId?: string) {
    const existing = this.queue.find((item) => item.id === player.id);
    if (existing) return { queued: true as const };
    let opponentIndex = -1;
    for (let index = 0; index < this.queue.length; index += 1) {
      const queuedPlayer = this.queue[index];
      if (queuedPlayer.id === player.id) continue;
      if (accountId && queuedPlayer.accountId) {
        const [playerBlockedOpponent, opponentBlockedPlayer] = await Promise.all([
          isBlocked(accountId, queuedPlayer.accountId),
          isBlocked(queuedPlayer.accountId, accountId),
        ]);
        if (playerBlockedOpponent || opponentBlockedPlayer) continue;
      }
      opponentIndex = index;
      break;
    }
    const nextPlayer: DuelPlayer = { ...player, accountId, status: "CONNECTED", score: 0 };
    if (opponentIndex < 0) { this.queue.push(nextPlayer); return { queued: true as const }; }
    const opponent = this.queue.splice(opponentIndex, 1)[0];
    const match: InternalDuel = { id: id(), code: code(), seed: randomBytes(2).readUInt16BE(0), status: "PLAYING", revision: 1, round: 1, players: [opponent, nextPlayer], answers: {}, continued: [], createdAt: new Date().toISOString(), rewarded: false };
    this.matches.set(match.id, match);
    await this.save(match);
    return { match: snapshot(match) };
  }

  async cancel(playerId: string) {
    const index = this.queue.findIndex((player) => player.id === playerId);
    if (index >= 0) this.queue.splice(index, 1);
    return { queued: false as const };
  }

  private read(matchId: string) {
    const match = this.matches.get(matchId);
    if (!match) throw new PvpServiceError("ROOM_NOT_FOUND", "No encontramos esta partida.");
    return match;
  }

  async answer(matchId: string, playerId: string, round: number, option: number) {
    const match = this.read(matchId);
    if (match.status !== "PLAYING" || match.round !== round) throw new PvpServiceError("INVALID_STATE", "Esta pregunta ya no está activa.");
    if (!match.players.some((player) => player.id === playerId && player.status === "CONNECTED")) throw new PvpServiceError("NOT_ALLOWED", "No puedes responder en esta partida.");
    if (playerId in match.answers) throw new PvpServiceError("INVALID_STATE", "Ya respondiste esta pregunta.");
    const question = duelQuestionFor(match.seed, match.round);
    if (option < 0 || option >= question.options.length) throw new PvpServiceError("INVALID_INPUT", "Esa respuesta no existe.");
    match.answers[playerId] = option;
    if (Object.keys(match.answers).length === match.players.filter((player) => player.status === "CONNECTED").length) {
      for (const player of match.players) if (match.answers[player.id] === question.correct) player.score += 100;
      match.status = "ROUND_RESULT";
      match.lastRound = { correctOption: question.correct, explanations: question.explanation, scores: Object.fromEntries(match.players.map((player) => [player.id, player.score])) };
      match.continued = [];
    }
    match.revision += 1;
    await this.save(match);
    return snapshot(match);
  }

  async continue(matchId: string, playerId: string, round: number) {
    const match = this.read(matchId);
    if (match.status !== "ROUND_RESULT" || match.round !== round) throw new PvpServiceError("INVALID_STATE", "Espera el resultado de esta ronda.");
    if (!match.players.some((player) => player.id === playerId && player.status === "CONNECTED")) throw new PvpServiceError("NOT_ALLOWED", "No puedes continuar esta partida.");
    if (!match.continued.includes(playerId)) match.continued.push(playerId);
    const connected = match.players.filter((player) => player.status === "CONNECTED");
    if (match.continued.length >= connected.length) {
      if (match.round >= TOTAL_ROUNDS) this.finishByScore(match);
      else { match.round += 1; match.status = "PLAYING"; match.answers = {}; match.continued = []; match.lastRound = undefined; }
    }
    match.revision += 1;
    await this.save(match);
    return snapshot(match);
  }

  private finishByScore(match: InternalDuel, reason: "SCORE" | "DISCONNECT" = "SCORE", forcedWinner?: string) {
    const sorted = [...match.players].sort((first, second) => second.score - first.score);
    const winnerId = forcedWinner ?? (sorted[0].score === sorted[1].score ? undefined : sorted[0].id);
    match.status = "FINISHED";
    match.result = { winnerId, outcome: winnerId ? "WIN" : "DRAW", reason };
    match.disconnectDeadline = undefined;
  }

  async disconnect(matchId: string | undefined, playerId: string | undefined) {
    if (!matchId || !playerId) return undefined;
    const match = this.matches.get(matchId);
    if (!match || match.status === "FINISHED" || match.status === "ABANDONED") return undefined;
    const player = match.players.find((item) => item.id === playerId);
    if (!player) return undefined;
    player.status = "DISCONNECTED";
    match.disconnectDeadline = new Date(Date.now() + RECONNECT_GRACE_MS).toISOString();
    match.revision += 1;
    const timerKey = `${matchId}:${playerId}`;
    const previousTimer = this.disconnectTimers.get(timerKey);
    if (previousTimer) clearTimeout(previousTimer);
    this.disconnectTimers.set(timerKey, setTimeout(() => { void this.forfeitIfDisconnected(matchId, playerId); }, RECONNECT_GRACE_MS));
    await this.save(match);
    return snapshot(match);
  }

  private async forfeitIfDisconnected(matchId: string, playerId: string) {
    const match = this.matches.get(matchId);
    const player = match?.players.find((item) => item.id === playerId);
    if (!match || !player || player.status !== "DISCONNECTED" || match.status === "FINISHED") return;
    player.status = "LEFT";
    const opponent = match.players.find((item) => item.id !== playerId && item.status === "CONNECTED");
    if (opponent) this.finishByScore(match, "DISCONNECT", opponent.id);
    else { match.status = "ABANDONED"; match.result = { outcome: "ABANDONED", reason: "DISCONNECT" }; }
    match.revision += 1;
    await this.save(match);
  }

  async rejoin(matchId: string, player: PublicPlayerIdentity, accountId?: string) {
    const match = this.read(matchId);
    const participant = match.players.find((item) => item.id === player.id);
    if (!participant || match.status === "FINISHED" || match.status === "ABANDONED") throw new PvpServiceError("ROOM_NOT_FOUND", "Esta partida ya terminó.");
    Object.assign(participant, player, { accountId, status: "CONNECTED" as const });
    const timerKey = `${matchId}:${player.id}`;
    const timer = this.disconnectTimers.get(timerKey);
    if (timer) clearTimeout(timer);
    this.disconnectTimers.delete(timerKey);
    if (!match.players.some((item) => item.status === "DISCONNECTED")) match.disconnectDeadline = undefined;
    match.revision += 1;
    await this.save(match);
    return snapshot(match);
  }

  get(matchId: string) { return snapshot(this.read(matchId)); }

  sweep() {
    for (const [matchId, match] of this.matches) if ((match.status === "FINISHED" || match.status === "ABANDONED") && Date.now() - new Date(match.createdAt).getTime() > 60 * 60 * 1000) this.matches.delete(matchId);
  }
}
