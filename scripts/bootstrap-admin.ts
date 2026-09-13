import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const nickname = process.env.ADMIN_BOOTSTRAP_NICKNAME?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!nickname || !password || password.length < 12) throw new Error("Define ADMIN_BOOTSTRAP_NICKNAME y ADMIN_BOOTSTRAP_PASSWORD (mínimo 12 caracteres).\nNo guardes estos valores en el repositorio.");
  const passwordHash = await bcrypt.hash(password, 12);
  const existingProfile = await prisma.profile.findUnique({ where: { nickname }, select: { userId: true } });
  const credential = { upsert: { create: { passwordHash }, update: { passwordHash, passwordUpdatedAt: new Date() } } };
  const account = existingProfile
    ? await prisma.user.update({ where: { id: existingProfile.userId }, data: { role: "ADMIN", credential, wallet: { upsert: { create: {}, update: {} } } }, include: { profile: true } })
    : await prisma.user.create({ data: { role: "ADMIN", profile: { create: { nickname, avatarKey: "spark" } }, credential: { create: { passwordHash } }, wallet: { create: {} } }, include: { profile: true } });
  console.log(`Administrador preparado: ${account.profile?.nickname}`);
}

main().finally(() => prisma.$disconnect());
