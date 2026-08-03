/**
 * Cache Middleware — adds ETag-based caching and Cache-Control headers
 * to reduce server load and improve response times for frequently-accessed data.
 */
const crypto = require('crypto');

/**
 * Simple in-memory cache store with TTL support.
 * Falls back gracefully — no external dependency required.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.ttl) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlMs
    });
  }

  clear() {
    this.store.clear();
  }

  // Remove entries matching a pattern
  clearPattern(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) {
        this.store.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

/**
 * Middleware: Cache GET responses using ETags.
 * Browser sends If-None-Match header; server returns 304 Not Modified if unchanged.
 * 
 * @param {Object} options
 * @param {number} options.ttl - Cache TTL in milliseconds (default: 5 min)
 * @param {boolean} options.private - If true, adds 'private' to Cache-Control (default: false)
 */
const cacheMiddleware = (options = {}) => {
  const { ttl = 5 * 60 * 1000, private: isPrivate = false } = options;

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for requests with cache-busting params
    if (req.query._noCache === 'true') {
      return next();
    }

    const cacheKey = `${req.originalUrl}`;

    // Check ETag from client
    const cached = cache.get(cacheKey);
    if (cached) {
      const etag = crypto.createHash('md5').update(JSON.stringify(cached)).digest('hex');
      
      // Set ETag and Cache-Control
      res.set('ETag', `"${etag}"`);
      res.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}${isPrivate ? ', private' : ''}`);

      // If client has matching ETag, return 304
      if (req.headers['if-none-match'] === `"${etag}"`) {
        return res.status(304).end();
      }

      // Return cached response
      return res.json(cached);
    }

    // Capture the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && body) {
        const etag = crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');
        res.set('ETag', `"${etag}"`);
        res.set('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}${isPrivate ? ', private' : ''}`);
        cache.set(cacheKey, body, ttl);
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Clear the entire cache (e.g., after a content update)
 */
const clearCache = () => {
  cache.clear();
};

/**
 * Clear cache entries matching a URL pattern
 */
const clearCachePattern = (pattern) => {
  cache.clearPattern(pattern);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  clearCachePattern,
  MemoryCache
};
