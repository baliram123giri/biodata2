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

  /** Returns cached value if still fresh, otherwise calls loader and caches result. */
  async remember<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (entry && now < entry.expiresAt) {
      return entry.data as T;
    }
    const data = await loader();
    this.store.set(key, { data, expiresAt: now + ttlMs });
    return data;
  }

  /** Invalidate a single cache key (call after mutations). */
  invalidate(key: string) {
    this.store.delete(key);
  }

  /** Invalidate all keys that start with a given prefix. */
  invalidatePrefix(prefix: string) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  /** Clear the entire cache. */
  clear() {
    this.store.clear();
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
