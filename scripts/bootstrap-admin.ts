import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function main() {
  const nickname = process.env.ADMIN_BOOTSTRAP_NICKNAME?.trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!nickname || !password || password.length < 12) throw new Error("Define ADMIN_BOOTSTRAP_NICKNAME y ADMIN_BOOTSTRAP_PASSWORD (mínimo 12 caracteres).\nNo guardes estos valores en el repositorio.");
  const passwordHash = await bcrypt.hash(password, 12);
  const account = await prisma.user.upsert({
    where: { profile: { nickname } },
    update: { role: "ADMIN", credential: { upsert: { create: { passwordHash }, update: { passwordHash, passwordUpdatedAt: new Date() } } } },
    create: { role: "ADMIN", profile: { create: { nickname, avatarKey: "spark" } }, credential: { create: { passwordHash } }, wallet: { create: {} } },
    include: { profile: true },
  });
  console.log(`Administrador preparado: ${account.profile?.nickname}`);
}

main().finally(() => prisma.$disconnect());
