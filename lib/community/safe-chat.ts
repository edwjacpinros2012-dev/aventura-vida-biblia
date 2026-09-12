export const POSITIVE_MESSAGES = {
  great_job: "¡Buen trabajo!",
  keep_going: "¡Sigue adelante!",
  good_game: "¡Buena partida!",
  you_can_do_it: "¡Tú puedes!",
  bless_you: "¡Dios te bendiga!",
} as const;

export type PositiveMessageKey = keyof typeof POSITIVE_MESSAGES;

const blockedTerms = /\b(insulto|amenaza|groser[ií]a|matar|kill|hate)\b/i;
const personalData = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/i,
  /(?:https?:\/\/|www\.)\S+/i,
  /(?:\+?\d[\s().-]*){7,}/,
  /\b(?:contrase(?:ñ|n)a|password|c[oó]digo|direcci[oó]n|calle|colegio)\b/i,
];

export type SafeChatCheck =
  | { ok: true; text: string; presetKey?: PositiveMessageKey }
  | { ok: false; reason: "PERSONAL_DATA" | "INAPPROPRIATE" | "INVALID"; text: string };

export function checkSafeChatMessage(input: { text?: string; presetKey?: string }): SafeChatCheck {
  if (input.presetKey && input.presetKey in POSITIVE_MESSAGES) {
    const presetKey = input.presetKey as PositiveMessageKey;
    return { ok: true, text: POSITIVE_MESSAGES[presetKey], presetKey };
  }
  if (typeof input.text !== "string") return { ok: false, reason: "INVALID", text: "" };
  const text = input.text.replace(/\s+/g, " ").trim();
  if (text.length < 1 || text.length > 120) return { ok: false, reason: "INVALID", text };
  if (personalData.some((pattern) => pattern.test(text))) return { ok: false, reason: "PERSONAL_DATA", text };
  if (blockedTerms.test(text)) return { ok: false, reason: "INAPPROPRIATE", text };
  return { ok: true, text };
}
