/**
 * setup.mjs — initialise la base SQLite sans CLI Prisma.
 * Crée les tables si elles n'existent pas, puis seed le superadmin.
 * Utilise uniquement @prisma/client et bcryptjs (copiés dans le runner).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "email"     TEXT NOT NULL UNIQUE,
      "password"  TEXT NOT NULL,
      "name"      TEXT NOT NULL,
      "role"      TEXT NOT NULL DEFAULT 'user',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserTaskAccess" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "userId"    TEXT NOT NULL,
      "taskId"    TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserTaskAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "UserTaskAccess_userId_taskId_key" UNIQUE ("userId", "taskId")
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "EmailTemplate" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL,
      "blocks"    TEXT NOT NULL,
      "userId"    TEXT NOT NULL,
      "updatedAt" DATETIME NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AppConfig" (
      "key"       TEXT NOT NULL PRIMARY KEY,
      "value"     TEXT NOT NULL,
      "updatedAt" DATETIME NOT NULL
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "N8nInstance" (
      "id"        TEXT NOT NULL PRIMARY KEY,
      "name"      TEXT NOT NULL,
      "baseUrl"   TEXT NOT NULL,
      "apiKey"    TEXT NOT NULL,
      "active"    INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )
  `);

  console.log("Tables vérifiées / créées.");
}

async function seed() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Seed ignoré — utilisateurs déjà présents.");
    return;
  }

  const email    = process.env.ADMIN_EMAIL    ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const name     = process.env.ADMIN_NAME     ?? "Super Admin";

  const hashed = await bcrypt.hash(password, 12);

  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await prisma.$executeRawUnsafe(
    `INSERT INTO "User" ("id","email","password","name","role","createdAt") VALUES (?,?,?,?,'superadmin',CURRENT_TIMESTAMP)`,
    id, email, hashed, name
  );
  console.log(`Superadmin créé : ${email}`);
}

async function main() {
  await createTables();
  await seed();
}

main()
  .catch((e) => { console.error("Setup error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
