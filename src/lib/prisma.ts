import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require("@libsql/client");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require("@prisma/adapter-libsql");
      const libsql = createClient({ url: tursoUrl, authToken: tursoToken });
      const adapter = new PrismaLibSql(libsql);
      return new PrismaClient({ adapter } as any);
    } catch {
      // fallback to local sqlite
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const prisma: PrismaClient = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;
