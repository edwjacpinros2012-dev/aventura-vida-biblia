import OpenAI from "openai";
import { z } from "zod";
import type { DailyBibleChallenge } from "@/lib/daily-bible-challenge";

const REQUEST_TIMEOUT_MS = 20_000;

const proposalSchema = z.object({
  kind: z.enum(["QUIZ_DRAFT", "EVENT_DRAFT", "ADVENTURE_CHAPTER", "MAZE_LEVEL", "FIND_DIFFERENCES"]),
  title: z.string().trim().min(4).max(90),
  description: z.string().trim().min(20).max(500),
  educationalGoal: z.string().trim().min(10).max(240),
  ageMin: z.number().int().min(3).max(13),
  ageMax: z.number().int().min(3).max(13),
  bibleReference: z.string().trim().min(4).max(80),
  story: z.string().trim().min(20).max(700),
  instructions: z.array(z.string().trim().min(3).max(160)).min(2).max(4),
  rewardXp: z.number().int().min(0).max(100),
  rewardPoints: z.number().int().min(0).max(100),
  targetGameSlug: z.string().trim().regex(/^[a-z0-9-]{3,80}$/),
  targetAdventureSlug: z.string().trim().regex(/^(|[a-z0-9-]{3,80})$/),
  questions: z.array(z.object({
    prompt: z.string().trim().min(8).max(260),
    options: z.array(z.string().trim().min(1).max(140)).min(2).max(4),
    correct: z.number().int().min(0).max(3),
    explanation: z.string().trim().min(8).max(360),
  })).min(0).max(3),
}).superRefine((proposal, context) => {
  if (proposal.ageMin > proposal.ageMax) context.addIssue({ code: z.ZodIssueCode.custom, message: "El rango de edad no es válido." });
  proposal.questions.forEach((question, index) => {
    if (question.correct >= question.options.length) context.addIssue({ code: z.ZodIssueCode.custom, message: `La respuesta ${index + 1} no existe.` });
    if (new Set(question.options.map((option) => option.toLocaleLowerCase())).size !== question.options.length) context.addIssue({ code: z.ZodIssueCode.custom, message: `La pregunta ${index + 1} repite opciones.` });
  });
  if (proposal.kind === "ADVENTURE_CHAPTER" && !proposal.targetAdventureSlug) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Un capítulo debe elegir una aventura existente." });
  }
});

export type AiBibleContentProposal = z.infer<typeof proposalSchema>;

type ProviderStatus =
  | { configured: false; reason: "missing-api-key" }
  | { configured: true; provider: "openai"; model: string };

export function aiProviderStatus(): ProviderStatus {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return { configured: false, reason: "missing-api-key" };
  return { configured: true, provider: "openai", model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini" };
}

function schemaForResponse() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["kind", "title", "description", "educationalGoal", "ageMin", "ageMax", "bibleReference", "story", "instructions", "rewardXp", "rewardPoints", "targetGameSlug", "targetAdventureSlug", "questions"],
    properties: {
      kind: { type: "string", enum: ["QUIZ_DRAFT", "EVENT_DRAFT", "ADVENTURE_CHAPTER", "MAZE_LEVEL", "FIND_DIFFERENCES"] },
      title: { type: "string" },
      description: { type: "string" },
      educationalGoal: { type: "string" },
      ageMin: { type: "integer" },
      ageMax: { type: "integer" },
      bibleReference: { type: "string" },
      story: { type: "string" },
      instructions: { type: "array", items: { type: "string" } },
      rewardXp: { type: "integer" },
      rewardPoints: { type: "integer" },
      targetGameSlug: { type: "string" },
      targetAdventureSlug: { type: "string" },
      questions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["prompt", "options", "correct", "explanation"],
          properties: {
            prompt: { type: "string" },
            options: { type: "array", items: { type: "string" } },
            correct: { type: "integer" },
            explanation: { type: "string" },
          },
        },
      },
    },
  } as const;
}

/**
 * Propone contenido con Structured Outputs en el servidor. La propuesta nunca
 * se publica automáticamente: la única fuente bíblica suministrada al modelo
 * es la plantilla curada vigente y el resultado queda pendiente de revisión.
 */
export async function generateAiBibleProposal(input: {
  dateKey: string;
  challenge: DailyBibleChallenge;
  gameOptions: ReadonlyArray<{ slug: string; name: string; gameKey: string; category: string; suggestedAge: string }>;
  adventureOptions: ReadonlyArray<{ slug: string; title: string; chapters: number }>;
  /** Tipos que cuentan con adaptador jugable y validado en esta versión. */
  allowedKinds: readonly AiBibleContentProposal["kind"][];
}) {
  const status = aiProviderStatus();
  if (!status.configured) return { status: "disabled" as const, reason: status.reason };
  if (!input.gameOptions.length) throw new Error("No hay juegos internos autorizados para la propuesta.");
  if (!input.allowedKinds.length) throw new Error("No hay tipos de contenido jugable autorizados para la propuesta.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: status.model,
      max_output_tokens: 1_200,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: "Eres un asistente editorial para Aventura Vida Biblia. Devuelve SOLO JSON siguiendo el esquema. Crea una propuesta infantil, inclusiva, no violenta y educativa. No inventes hechos ni referencias bíblicas: usa exactamente la referencia y el fragmento curado suministrados. No incluyas datos personales, enlaces, anuncios, compras ni instrucciones inseguras. La propuesta será revisada por una persona antes de publicarse." }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: `Fecha editorial: ${input.dateKey}\nReferencia curada obligatoria: ${input.challenge.verse.reference}\nFragmento curado: ${input.challenge.verse.text}\nTema: ${input.challenge.title}\nObjetivo: ${input.challenge.objective}\nJuegos internos autorizados: ${input.gameOptions.map((game) => `${game.slug} (${game.name}; ${game.category}; edades ${game.suggestedAge})`).join(" | ")}\nAventuras autorizadas: ${input.adventureOptions.map((adventure) => `${adventure.slug} (${adventure.title}; ${adventure.chapters} capítulos)`).join(" | ")}\nTipos permitidos para esta ejecución: ${input.allowedKinds.join(", ")}.\nPropón un único contenido nuevo que complemente el reto. bibleReference debe ser exactamente \"${input.challenge.verse.reference}\". targetGameSlug debe coincidir exactamente con uno de los juegos internos autorizados. Si kind es ADVENTURE_CHAPTER, targetAdventureSlug debe coincidir exactamente con una aventura autorizada; si no lo es, usa una cadena vacía. Las preguntas solo pueden apoyarse en el fragmento o en el objetivo entregado.` }],
        },
      ],
      text: { format: { type: "json_schema", name: "aventura_vida_bible_proposal", strict: true, schema: schemaForResponse() } },
    }, { signal: controller.signal });
    if (!response.output_text) throw new Error("El proveedor de IA no devolvió contenido estructurado.");
    const proposal = proposalSchema.parse(JSON.parse(response.output_text));
    if (!input.allowedKinds.includes(proposal.kind)) throw new Error("La propuesta no usa un tipo de contenido jugable autorizado.");
    if (proposal.bibleReference !== input.challenge.verse.reference) throw new Error("La propuesta cambió la referencia bíblica curada.");
    if (!input.gameOptions.some((game) => game.slug === proposal.targetGameSlug)) throw new Error("La propuesta eligió un juego no autorizado.");
    if (proposal.targetAdventureSlug && !input.adventureOptions.some((adventure) => adventure.slug === proposal.targetAdventureSlug)) throw new Error("La propuesta eligió una aventura no autorizada.");
    return { status: "generated" as const, proposal, provider: status.provider, model: status.model };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falló la propuesta de IA.";
    throw new Error(message.slice(0, 500));
  } finally {
    clearTimeout(timer);
  }
}
