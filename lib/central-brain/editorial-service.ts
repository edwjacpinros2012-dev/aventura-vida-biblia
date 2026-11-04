import { adventures, games } from "@/lib/content";
import { generateAiBibleProposal, type AiBibleContentProposal } from "@/lib/content-automation/ai-provider";
import { internalGameRegistry } from "@/lib/games/registry";
import type { DailyBibleChallenge } from "@/lib/daily-bible-challenge";
import { assertCentralBrainPermission, centralBrainForbiddenOperations, centralBrainPermissions } from "@/lib/central-brain/contracts";

export type CentralBrainGameContext = {
  slug: string;
  name: string;
  gameKey: string;
  category: string;
  suggestedAge: string;
};

export type CentralBrainAdventureContext = {
  slug: string;
  title: string;
  chapters: number;
};

export type CentralBrainEditorialContext = {
  dateKey: string;
  challengeId: string;
  bibleReference: string;
  games: CentralBrainGameContext[];
  adventures: CentralBrainAdventureContext[];
};

/**
 * Cruza el catálogo público con el registro de módulos ejecutables. Así una
 * propuesta no puede inventar una ruta ni señalar una ficha no jugable.
 */
export function centralBrainEditorialContextFor(challenge: DailyBibleChallenge): CentralBrainEditorialContext {
  assertCentralBrainPermission("catalog.read");
  assertCentralBrainPermission("missions.read");

  const availableGames = games
    .filter((game) => game.isPlayable && Boolean(game.gameKey) && Boolean(internalGameRegistry[game.gameKey!]))
    .map((game) => ({
      slug: game.slug,
      name: game.name,
      gameKey: game.gameKey!,
      category: game.category,
      suggestedAge: game.suggestedAge,
    }));

  if (!availableGames.length) throw new Error("El cerebro central no encontró juegos internos jugables.");

  const availableAdventures = adventures.map((adventure) => ({
    slug: adventure.slug,
    title: adventure.title,
    chapters: adventure.chapters,
  }));
  if (!availableAdventures.length) throw new Error("El cerebro central no encontró aventuras autorizadas.");

  return {
    dateKey: challenge.dateKey,
    challengeId: challenge.id,
    bibleReference: challenge.verse.reference,
    games: availableGames,
    adventures: availableAdventures,
  };
}

export type CentralBrainDraft = AiBibleContentProposal & {
  targetGameSlug: string;
};

/**
 * Única puerta de IA para el cron editorial. El resultado sigue siendo un
 * borrador: daily-content-service es quien lo registra y la consola de
 * moderación conserva la aprobación/publicación humana.
 */
export async function proposeCentralEditorialDraft(input: { dateKey: string; challenge: DailyBibleChallenge }) {
  assertCentralBrainPermission("content.draft.create");
  const context = centralBrainEditorialContextFor(input.challenge);
  if (context.dateKey !== input.dateKey) throw new Error("La fecha editorial no coincide con el reto curado.");
  const playableGameOptions = context.games.filter((game) => game.slug === "preguntas-de-aventura");
  if (!playableGameOptions.length) throw new Error("No existe un módulo de preguntas autorizado para la propuesta automática.");

  const generated = await generateAiBibleProposal({
    dateKey: input.dateKey,
    challenge: input.challenge,
    gameOptions: playableGameOptions,
    adventureOptions: context.adventures,
    // Por ahora Preguntas Bíblicas es el único adaptador de contenido IA que
    // se puede abrir y jugar mediante un componente existente. Los otros
    // tipos se habilitan solo al agregar sus adaptadores equivalentes.
    allowedKinds: ["QUIZ_DRAFT"],
  });

  if (generated.status === "disabled") return generated;
  if (!playableGameOptions.some((game) => game.slug === generated.proposal.targetGameSlug)) {
    throw new Error("La propuesta eligió un juego que no tiene adaptador jugable autorizado.");
  }
  if (generated.proposal.targetAdventureSlug && !context.adventures.some((adventure) => adventure.slug === generated.proposal.targetAdventureSlug)) {
    throw new Error("La propuesta eligió una aventura que no pertenece al catálogo actual.");
  }

  return { ...generated, context };
}

/** Metadatos seguros para documentación y futuras consolas administrativas. */
export const centralBrainPolicy = {
  allowed: centralBrainPermissions,
  forbidden: centralBrainForbiddenOperations,
  publication: "human-review-required",
  sharedRuntime: "server-only",
} as const;
