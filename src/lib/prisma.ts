import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/biodata";
  const pool = new pg.Pool({
    connectionString: dbUrl,
  });
  const adapter = new PrismaPg(pool);
  
  if (process.env.NODE_ENV === "production") {
    prismaInstance = new PrismaClient({ adapter });
  } else {
    // Always invalidate dev cache to reload the newly generated models and fields
    if (globalForPrisma.prisma) {
      delete (globalForPrisma as any).prisma;
    }

    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prismaInstance = globalForPrisma.prisma;
  }
} else {
  prismaInstance = null as any;
}

export const prisma = prismaInstance;
