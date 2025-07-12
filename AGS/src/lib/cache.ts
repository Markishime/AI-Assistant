// Comprehensive caching system for AGS application

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  compress?: boolean;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 1000;

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  // Set cache entry
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const storage = options.storage || 'memory';
    const expiry = Date.now() + ttl;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry,
      key,
    };

    try {
      switch (storage) {
        case 'memory':
          this.setMemoryCache(key, entry);
          break;
        case 'localStorage':
          this.setStorageCache(key, entry, localStorage);
          break;
        case 'sessionStorage':
          this.setStorageCache(key, entry, sessionStorage);
          break;
      }
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  // Get cache entry
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const storage = options.storage || 'memory';

    try {
      let entry: CacheEntry<T> | null = null;

      switch (storage) {
        case 'memory':
          entry = this.getMemoryCache(key);
          break;
        case 'localStorage':
          entry = this.getStorageCache(key, localStorage);
          break;
        case 'sessionStorage':
          entry = this.getStorageCache(key, sessionStorage);
          break;
      }

      if (!entry) return null;

      // Check if expired
      if (Date.now() > entry.expiry) {
        this.delete(key, options);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  // Delete cache entry
  delete(key: string, options: CacheOptions = {}): void {
    const storage = options.storage || 'memory';

    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'localStorage':
          localStorage.removeItem(this.getCacheKey(key));
          break;
        case 'sessionStorage':
          sessionStorage.removeItem(this.getCacheKey(key));
          break;
      }
    } catch (error) {
      console.warn('Cache delete failed:', error);
    }
  }

  // Clear all cache
  clear(storage: CacheOptions['storage'] = 'memory'): void {
    try {
      switch (storage) {
        case 'memory':
          this.memoryCache.clear();
          break;
        case 'localStorage':
          this.clearStorage(localStorage);
          break;
        case 'sessionStorage':
          this.clearStorage(sessionStorage);
          break;
      }
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  // Check if key exists and is valid
  has(key: string, options: CacheOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  // Get cache stats
  getStats(storage: CacheOptions['storage'] = 'memory') {
    switch (storage) {
      case 'memory':
        return {
          size: this.memoryCache.size,
          entries: Array.from(this.memoryCache.values()).map(entry => ({
            key: entry.key,
            timestamp: entry.timestamp,
            expiry: entry.expiry,
            expired: Date.now() > entry.expiry,
          })),
        };
      default:
        return { size: 0, entries: [] };
    }
  }

  // Cleanup expired entries
  cleanup(storage: CacheOptions['storage'] = 'memory'): void {
    try {
      switch (storage) {
        case 'memory':
          Array.from(this.memoryCache.entries()).forEach(([key, entry]) => {
            if (Date.now() > entry.expiry) {
              this.memoryCache.delete(key);
            }
          });
          break;
        case 'localStorage':
          this.cleanupStorage(localStorage);
          break;
        case 'sessionStorage':
          this.cleanupStorage(sessionStorage);
          break;
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }

  private setMemoryCache<T>(key: string, entry: CacheEntry<T>): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }
    this.memoryCache.set(key, entry);
  }

  private getMemoryCache<T>(key: string): CacheEntry<T> | null {
    return this.memoryCache.get(key) || null;
  }

  private setStorageCache<T>(key: string, entry: CacheEntry<T>, storage: Storage): void {
    const cacheKey = this.getCacheKey(key);
    const serialized = JSON.stringify(entry);
    storage.setItem(cacheKey, serialized);
  }

  private getStorageCache<T>(key: string, storage: Storage): CacheEntry<T> | null {
    const cacheKey = this.getCacheKey(key);
    const serialized = storage.getItem(cacheKey);
    if (!serialized) return null;
    return JSON.parse(serialized);
  }

  private clearStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('ags_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private cleanupStorage(storage: Storage): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('ags_cache_')) {
        try {
          const entry = JSON.parse(storage.getItem(key) || '');
          if (Date.now() > entry.expiry) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach(key => storage.removeItem(key));
  }

  private getCacheKey(key: string): string {
    return `ags_cache_${key}`;
  }
}

// Global cache instance
export const cache = new CacheManager();

// API Response Cache
class ApiCache {
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager({
      ttl: 2 * 60 * 1000, // 2 minutes for API responses
      maxSize: 500,
    });
  }

  // Cache API response
  cacheResponse(url: string, method: string, body: any, response: any, ttl?: number): void {
    const key = this.generateKey(url, method, body);
    this.cache.set(key, response, { ttl });
  }

  // Get cached response
  getCachedResponse(url: string, method: string, body: any): any {
    const key = this.generateKey(url, method, body);
    return this.cache.get(key);
  }

  // Check if response is cached
  hasResponse(url: string, method: string, body: any): boolean {
    const key = this.generateKey(url, method, body);
    return this.cache.has(key);
  }

  // Invalidate specific endpoint
  invalidate(url: string, method?: string): void {
    const pattern = method ? `${method}:${url}` : url;
    // For simplicity, clear all cache if specific invalidation is needed
    this.cache.clear();
  }

  private generateKey(url: string, method: string, body: any): string {
    const bodyHash = body ? this.hashObject(body) : '';
    return `${method}:${url}:${bodyHash}`;
  }

  private hashObject(obj: any): string {
    return btoa(JSON.stringify(obj)).slice(0, 16);
  }
}

export const apiCache = new ApiCache();

// React hook for cached API calls
export function useCachedFetch<T>(
  url: string,
  options: RequestInit & { ttl?: number } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const { ttl, ...fetchOptions } = options;
  const method = fetchOptions.method || 'GET';
  const body = fetchOptions.body;

  React.useEffect(() => {
    const fetchData = async () => {
      // Check cache first
      const cachedResponse = apiCache.getCachedResponse(url, method, body);
      if (cachedResponse) {
        setData(cachedResponse);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Cache the response
        apiCache.cacheResponse(url, method, body, result, ttl);
        
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, JSON.stringify(body), ttl]);

  return { data, loading, error, refetch: () => {
    apiCache.invalidate(url, method);
    // Trigger re-fetch by clearing data
    setData(null);
  }};
}

// Component state cache
class ComponentStateCache {
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager({
      ttl: 30 * 60 * 1000, // 30 minutes
      storage: 'sessionStorage',
    });
  }

  saveState(componentId: string, state: any): void {
    this.cache.set(`component_${componentId}`, state, { storage: 'sessionStorage' });
  }

  restoreState<T>(componentId: string): T | null {
    return this.cache.get(`component_${componentId}`, { storage: 'sessionStorage' });
  }

  clearState(componentId: string): void {
    this.cache.delete(`component_${componentId}`, { storage: 'sessionStorage' });
  }
}

export const componentStateCache = new ComponentStateCache();

// React hook for persistent component state
export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  ttl?: number
): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(() => {
    const cached = cache.get<T>(key, { storage: 'localStorage', ttl });
    return cached !== null ? cached : defaultValue;
  });

  const setPersistentState = React.useCallback((value: T) => {
    setState(value);
    cache.set(key, value, { storage: 'localStorage', ttl });
  }, [key, ttl]);

  return [state, setPersistentState];
}

// Search results cache
class SearchCache {
  private cache: CacheManager;

  constructor() {
    this.cache = new CacheManager({
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
    });
  }

  cacheSearchResults(query: string, filters: any, results: any): void {
    const key = this.generateSearchKey(query, filters);
    this.cache.set(key, results);
  }

  getCachedSearchResults(query: string, filters: any): any {
    const key = this.generateSearchKey(query, filters);
    return this.cache.get(key);
  }

  invalidateSearch(): void {
    this.cache.clear();
  }

  private generateSearchKey(query: string, filters: any): string {
    return `search_${query}_${JSON.stringify(filters)}`;
  }
}

export const searchCache = new SearchCache();

// Cache cleanup service
class CacheCleanupService {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 5 * 60 * 1000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      cache.cleanup('memory');
      cache.cleanup('localStorage');
      cache.cleanup('sessionStorage');
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const cacheCleanupService = new CacheCleanupService();

// Initialize cleanup service
if (typeof window !== 'undefined') {
  cacheCleanupService.start();
}

// React imports for hooks
import React from 'react'; 