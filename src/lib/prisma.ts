// Refreshed comment to trigger next.js turbopack compile cache reload (Mantras update)
import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient;
  pgPool: pg.Pool;
};

function createPool(): pg.Pool {
  const dbUrl =
    process.env.DATABASE_URL

  return new pg.Pool({
    connectionString: dbUrl,
    // Keep connections alive to avoid P1017 "Server closed the connection"
    idleTimeoutMillis: 30_000,       // drop idle connections after 30 s
    connectionTimeoutMillis: 10_000, // fail fast if we can't connect in 10 s
    max: 10,                          // cap pool size
    keepAlive: true,                  // TCP keepalive so the OS doesn't drop the socket
  });
}

function createPrisma(pool: pg.Pool): PrismaClient {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === "production") {
    // Production: create once per process
    const pool = createPool();
    prismaInstance = createPrisma(pool);
  } else {
    // Development: reuse across hot-reloads but DON'T destroy on every reload
    // (destroying the old instance orphaned the underlying pg.Pool)
    if (!globalForPrisma.pgPool) {
      globalForPrisma.pgPool = createPool();
    }
    if (!globalForPrisma.prisma_v3) {
      globalForPrisma.prisma_v3 = createPrisma(globalForPrisma.pgPool);
    }
    prismaInstance = globalForPrisma.prisma_v3;
  }
} else {
  prismaInstance = null as any;
}

export const prisma = prismaInstance;

/**
 * Wraps a Prisma call with automatic retry on P1017 (connection closed).
 * Useful for routes that might hit a stale pooled connection.
 *
 * Usage:
 *   const result = await withRetry(() => prisma.order.findMany(...));
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 300
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isConnectionClosed =
        err?.code === "P1017" ||
        err?.message?.includes("ConnectionClosed") ||
        err?.message?.includes("Server has closed the connection");

      if (isConnectionClosed && attempt < retries) {
        console.warn(
          `[prisma] Connection closed (attempt ${attempt}/${retries}), retrying in ${delayMs}ms…`
        );
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
  // Unreachable, but satisfies TypeScript
  throw new Error("withRetry exhausted all attempts");
}
