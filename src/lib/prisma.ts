import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const prisma: PrismaClient = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") global.prismaGlobal = prisma;
