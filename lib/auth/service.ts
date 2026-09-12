import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type SafeAccount } from "./contracts";

const SESSION_DAYS = 14;

export class AccountError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

type AccountRecord = {
  id: string;
  role: SafeAccount["role"];
  profile: { nickname: string; avatarKey: string; level: number; totalXp: number; points: number } | null;
  wallet: { adventureCoins: number } | null;
};

function safeAccount(account: AccountRecord): SafeAccount {
  if (!account.profile) throw new AccountError("Esta cuenta no tiene un perfil de jugador.", 500);
  return {
    id: account.id,
    nickname: account.profile.nickname,
    avatarKey: account.profile.avatarKey,
    role: account.role,
    level: account.profile.level,
    totalXp: account.profile.totalXp,
    points: account.profile.points,
    adventureCoins: account.wallet?.adventureCoins ?? 0,
  };
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function expiresAt() {
  return new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
}

export function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: string) {
  const token = newSessionToken();
  await prisma.userSession.create({
    data: { userId, tokenHash: tokenHash(token), expiresAt: expiresAt() },
  });
  return token;
}

export async function registerAccount(input: { nickname: string; avatarKey: string; password: string }) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    const account = await prisma.user.create({
      data: {
        profile: { create: { nickname: input.nickname, avatarKey: input.avatarKey } },
        credential: { create: { passwordHash } },
        wallet: { create: {} },
      },
      include: { profile: true, wallet: true },
    });
    return { account: safeAccount(account), token: await createSession(account.id) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AccountError("Ese apodo ya está en uso. Elige otro.", 409);
    }
    throw error;
  }
}

export async function loginAccount(input: { nickname: string; password: string }) {
  const account = await prisma.user.findFirst({
    where: { profile: { is: { nickname: input.nickname } } },
    include: { profile: true, credential: true, wallet: true },
  });
  // El mismo error evita revelar qué apodos ya tienen cuenta.
  if (!account?.credential || !(await bcrypt.compare(input.password, account.credential.passwordHash))) {
    throw new AccountError("El apodo o la contraseña no son correctos.", 401);
  }
  return { account: safeAccount(account), token: await createSession(account.id) };
}

export async function accountFromSessionToken(token: string | undefined | null) {
  if (!token || token.length > 128) return null;
  const session = await prisma.userSession.findFirst({
    where: { tokenHash: tokenHash(token), revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: { include: { profile: true, wallet: true } } },
  });
  return session ? safeAccount(session.user) : null;
}

export async function revokeSession(token: string | undefined | null) {
  if (!token) return;
  await prisma.userSession.updateMany({ where: { tokenHash: tokenHash(token), revokedAt: null }, data: { revokedAt: new Date() } });
}

export const sessionCookie = {
  name: "aventura_vida_session",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  },
};
