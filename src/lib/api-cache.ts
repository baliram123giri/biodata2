/**
 * Lightweight in-process TTL cache for admin API routes.
 *
 * Usage:
 *   import { apiCache } from "@/lib/api-cache";
 *
 *   // Read-through helper (fetch + cache in one call):
 *   const data = await apiCache.remember("key", 60_000, async () => {
 *     return await prisma.something.findMany();
 *   });
 *
 *   // Invalidate after a mutation so next GET is fresh:
 *   apiCache.invalidate("key");
 *   apiCache.invalidatePrefix("coupons"); // all keys starting with "coupons"
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class ApiCache {
  private store = new Map<string, CacheEntry<any>>();

  /** 
   * REFACTOR: Disabled backend API caching system-wide as requested.
   * All API queries now fetch fresh data directly from the database on every request.
   * Caching is managed strictly on the frontend using TanStack Query (React Query).
   */
  async remember<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    return await loader();
  }

  /** Invalidate a single cache key (no-op since backend caching is disabled). */
  invalidate(key: string) {
    // No-op as backend caching is bypassed
  }

  /** Invalidate all keys that start with a given prefix (no-op since backend caching is disabled). */
  invalidatePrefix(prefix: string) {
    // No-op as backend caching is bypassed
  }

  /** Clear the entire cache (no-op since backend caching is disabled). */
  clear() {
    // No-op as backend caching is bypassed
  }
}

// Singleton — shared across all hot-module reloads in dev via global
const globalCache = globalThis as any;
if (!globalCache.__apiCache) {
  globalCache.__apiCache = new ApiCache();
}
export const apiCache: ApiCache = globalCache.__apiCache;

// Cache TTL constants (milliseconds)
export const TTL = {
  /** 30 s — frequently updated data (transactions, dashboard stats) */
  SHORT: 30_000,
  /** 2 min — moderately changing data (coupons, users) */
  MEDIUM: 2 * 60_000,
  /** 5 min — rarely changing data (templates, hero slides, backgrounds) */
  LONG: 5 * 60_000,
} as const;
