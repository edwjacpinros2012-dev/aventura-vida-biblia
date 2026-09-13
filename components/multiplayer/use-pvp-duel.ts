"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { readMultiplayerIdentity } from "./use-multiplayer-room";
import type { SafeAccount } from "@/lib/auth/contracts";
import type { ClientToServerEvents, PublicPlayerIdentity, PvpDuelSnapshot, PvpResponse, ServerToClientEvents } from "@/lib/multiplayer/contracts";

type Connection = "connecting" | "connected" | "offline";

export function usePvpDuel() {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const matchRef = useRef<PvpDuelSnapshot | null>(null);
  const identityRef = useRef<PublicPlayerIdentity>({ id: "", nickname: "Explorador", avatar: "✦" });
  const [identity, setIdentity] = useState(identityRef.current);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [match, setMatch] = useState<PvpDuelSnapshot | null>(null);
  const [queueing, setQueueing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentMatch = useCallback((next: PvpDuelSnapshot | null) => { matchRef.current = next; setMatch(next); }, []);

  useEffect(() => {
    const fallback = readMultiplayerIdentity();
    identityRef.current = fallback; setIdentity(fallback);
    void fetch("/api/auth/me").then((response) => response.ok ? response.json() as Promise<{ account: SafeAccount | null }> : null).then((result) => {
      if (!result?.account) return;
      const authenticated = { id: `user_${result.account.id}`, nickname: result.account.nickname, avatar: result.account.avatarKey };
      identityRef.current = authenticated; setIdentity(authenticated);
    }).catch(() => undefined);
    const serverUrl = process.env.NEXT_PUBLIC_MULTIPLAYER_SERVER_URL ?? "http://localhost:3001";
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, { transports: ["websocket", "polling"], reconnectionAttempts: 4, timeout: 5_000, withCredentials: true });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnection("connected"); setError(null);
      const active = matchRef.current;
      if (active && active.status !== "FINISHED" && active.status !== "ABANDONED") {
        socket.emit("pvp:rejoin", { matchId: active.id, player: identityRef.current }, (response) => {
          if (response.match) setCurrentMatch(response.match);
          if (response.error) setError(response.error.message);
        });
      }
    });
    socket.on("disconnect", () => setConnection("offline"));
    socket.on("connect_error", () => setConnection("offline"));
    socket.on("pvp:queued", () => setQueueing(true));
    socket.on("pvp:state", (next) => { setQueueing(false); setCurrentMatch(next); });
    socket.on("pvp:error", (next) => setError(next.message));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [setCurrentMatch]);

  const request = useCallback((event: "pvp:queue" | "pvp:cancel" | "pvp:answer" | "pvp:continue", payload: unknown) => {
    const socket = socketRef.current;
    if (!socket?.connected) { setError("El servidor de duelos no está conectado."); return; }
    (socket.emit as (name: string, data: unknown, callback: (response: PvpResponse) => void) => void)(event, payload, (response) => {
      if (response.error) { setError(response.error.message); return; }
      setError(null);
      if (response.queued) setQueueing(true);
      if (response.match) { setQueueing(false); setCurrentMatch(response.match); }
    });
  }, [setCurrentMatch]);

  const findMatch = useCallback(() => request("pvp:queue", { gameKey: "bible-quiz-duel", player: identityRef.current }), [request]);
  const cancel = useCallback(() => { request("pvp:cancel", {}); setQueueing(false); }, [request]);
  const answer = useCallback((option: number) => { if (matchRef.current) request("pvp:answer", { matchId: matchRef.current.id, round: matchRef.current.round, option }); }, [request]);
  const continueRound = useCallback(() => { if (matchRef.current) request("pvp:continue", { matchId: matchRef.current.id, round: matchRef.current.round }); }, [request]);
  const clear = useCallback(() => { setQueueing(false); setCurrentMatch(null); setError(null); }, [setCurrentMatch]);

  return { identity, connection, match, queueing, error, findMatch, cancel, answer, continueRound, clear };
}
