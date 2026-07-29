import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "La variable d'environnement DATABASE_URL est absente. Vérifie le fichier .env.",
  );
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  postgresPool?: Pool;
};

const postgresPool =
  globalForPrisma.postgresPool ??
  new Pool({
    connectionString: databaseUrl,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

const adapter = new PrismaPg(postgresPool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.postgresPool = postgresPool;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  await postgresPool.end();
}
