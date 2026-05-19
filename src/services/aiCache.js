/**
 * Simple in-memory cache for Groq API calls to save credits.
 */

class SimpleTtlCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const categoryCache = new SimpleTtlCache();
export const analysisCache = new SimpleTtlCache();
export const routineCache = new SimpleTtlCache();
export const suggestionsCache = new SimpleTtlCache();
