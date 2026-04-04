import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    async adapter() {
      const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const dbUrl =
        process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "prisma", "db.sqlite")}`;
      const client = createClient({ url: dbUrl });
      return new PrismaLibSQL(client);
    },
  },
});
