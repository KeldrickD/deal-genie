/**
 * Simple in-memory cache for API results
 * In production, this should be replaced with Redis, Supabase, or another persistent cache
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class AnalysisCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Normalize and sanitize address for use as a cache key
   */
  private normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .trim();
  }

  /**
   * Get cached data if it exists and is not expired
   */
  get<T>(address: string): T | null {
    const key = this.normalizeAddress(address);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache entry is expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(address: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const key = this.normalizeAddress(address);
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Remove an entry from the cache
   */
  delete(address: string): boolean {
    const key = this.normalizeAddress(address);
    return this.cache.delete(key);
  }

  /**
   * Clear all expired entries from the cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get stats about the cache
   */
  getStats() {
    let expiredCount = 0;
    const now = Date.now();
    
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }
    
    return {
      totalEntries: this.cache.size,
      expiredEntries: expiredCount,
      validEntries: this.cache.size - expiredCount
    };
  }
}

// Export singleton instance
export const analysisCache = new AnalysisCache(); 