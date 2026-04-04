import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Base déjà initialisée, seed ignoré.");
    return;
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, password: hashed, name, role: "admin" } });
  console.log(`Admin créé : ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
