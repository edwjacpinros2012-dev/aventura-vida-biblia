import { z } from "zod";
import type { AiBibleContentProposal } from "@/lib/content-automation/ai-provider";

const quizQuestionSchema = z.object({
  category: z.enum(["Historias", "Valores", "Versículos"]),
  difficulty: z.enum(["Inicial", "Explorador"]),
  question: z.string().trim().min(8).max(260),
  options: z.array(z.string().trim().min(1).max(140)).min(2).max(4),
  correct: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(8).max(360),
}).superRefine((question, context) => {
  if (question.correct >= question.options.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "La respuesta correcta no está entre las opciones." });
  }
  if (new Set(question.options.map((option) => option.toLocaleLowerCase())).size !== question.options.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Las opciones de la pregunta se repiten." });
  }
});

export const playableQuizPackSchema = z.object({
  version: z.literal(1),
  kind: z.literal("QUIZ_DRAFT"),
  targetGameSlug: z.literal("preguntas-de-aventura"),
  title: z.string().trim().min(4).max(90),
  bibleReference: z.string().trim().min(4).max(80),
  questions: z.array(quizQuestionSchema).min(2).max(3),
});

export type PlayableQuizQuestion = z.infer<typeof quizQuestionSchema>;
export type PlayableQuizPack = z.infer<typeof playableQuizPackSchema>;

/**
 * Convierte exclusivamente una propuesta ya validada en contenido del juego
 * existente. No registra componentes, rutas, recompensas ni código nuevo.
 */
export function playableGamePackFromAiProposal(proposal: AiBibleContentProposal): PlayableQuizPack | null {
  if (proposal.kind !== "QUIZ_DRAFT" || proposal.targetGameSlug !== "preguntas-de-aventura" || proposal.questions.length < 2) return null;

  const categories = ["Historias", "Valores", "Versículos"] as const;
  const difficulty = proposal.ageMax <= 7 ? "Inicial" : "Explorador";
  const questions = proposal.questions.slice(0, 3).map((question, index) => ({
    category: categories[index % categories.length],
    difficulty,
    question: question.prompt,
    options: question.options,
    correct: question.correct,
    explanation: question.explanation,
  }));

  return playableQuizPackSchema.parse({
    version: 1,
    kind: "QUIZ_DRAFT",
    targetGameSlug: proposal.targetGameSlug,
    title: proposal.title,
    bibleReference: proposal.bibleReference,
    questions,
  });
}

/** Sólo admite packs que el cliente puede jugar con un componente existente. */
export function parsePlayableGamePack(payload: unknown) {
  const proposal = payload as Partial<AiBibleContentProposal> | null;
  if (!proposal || typeof proposal !== "object") return null;
  try {
    return playableGamePackFromAiProposal(proposal as AiBibleContentProposal);
  } catch {
    return null;
  }
}
