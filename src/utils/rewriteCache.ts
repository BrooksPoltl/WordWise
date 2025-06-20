interface CacheEntry {
  value: string;
  expiry: number;
}

export class RewriteCache {
  private prefix = 'wordwise_rewrite_';

  private ttl = 30 * 60 * 1000; // 30 minutes in milliseconds

  private static hashText(text: string): string {
    // Simple hash function for cache keys using string manipulation
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
      const char = text.charCodeAt(i);
      hash = Math.imul(hash, 31) + char;
    }
    return Math.abs(hash).toString(36); // Base36 for shorter strings, abs for positive
  }

  private getKey(type: 'passive' | 'readability', text: string): string {
    const hash = RewriteCache.hashText(text);
    return `${this.prefix}${type}_${hash}`;
  }

  get(type: 'passive' | 'readability', text: string): string | null {
    try {
      const key = this.getKey(type, text);
      const item = localStorage.getItem(key);
      
      if (!item) return null;
      
      const entry: CacheEntry = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > entry.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      
      return entry.value;
    } catch (error) {
      // Handle JSON parse errors or localStorage issues
      console.warn('RewriteCache: Error reading from cache', error);
      return null;
    }
  }

  set(type: 'passive' | 'readability', text: string, rewrite: string): void {
    try {
      const key = this.getKey(type, text);
      const entry: CacheEntry = {
        value: rewrite,
        expiry: Date.now() + this.ttl
      };
      
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      // Handle localStorage quota exceeded or other errors
      console.warn('RewriteCache: Error writing to cache', error);
      // Optionally try to clear old entries and retry
      this.cleanup();
    }
  }

  // Clean up expired entries to free up space
  private cleanup(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const entry: CacheEntry = JSON.parse(item);
              if (Date.now() > entry.expiry) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid JSON, remove it
              keysToRemove.push(key);
            }
          }
        }
      }
      
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('RewriteCache: Error during cleanup', error);
    }
  }

  // Clear all rewrite cache entries (useful for debugging)
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      
      for (const key of keysToRemove) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('RewriteCache: Error clearing cache', error);
    }
  }
}

// Export a singleton instance
export const rewriteCache = new RewriteCache(); 