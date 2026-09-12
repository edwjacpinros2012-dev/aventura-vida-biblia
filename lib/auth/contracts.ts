import { z } from "zod";

// Los apodos son la única identidad que se muestra a otros jugadores. No se
// solicitan nombres, correos ni otros datos personales para abrir una cuenta.
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "El apodo debe tener al menos 2 caracteres.")
  .max(20, "El apodo puede tener hasta 20 caracteres.")
  .regex(/^[\p{L}\p{N}_ -]+$/u, "Usa letras, números, espacios, _ o -.");

export const passwordSchema = z
  .string()
  .min(12, "Usa una contraseña de al menos 12 caracteres.")
  .max(128, "La contraseña es demasiado larga.");

export const registerAccountSchema = z.object({
  nickname: nicknameSchema,
  avatarKey: z.string().trim().min(1).max(24).default("fox"),
  password: passwordSchema,
});

export const loginSchema = z.object({
  nickname: nicknameSchema,
  password: z.string().min(1).max(128),
});

export type SafeAccount = {
  id: string;
  nickname: string;
  avatarKey: string;
  role: "PLAYER" | "ADMIN" | "MODERATOR" | "TEACHER" | "FAMILY";
  level: number;
  totalXp: number;
  points: number;
  adventureCoins: number;
};
