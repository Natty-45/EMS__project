// Simple in-memory rate limiter
const rateLimitStore = new Map();

const rateLimit = (maxRequests = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + req.path;
    const now = Date.now();

    // Clean up old entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.resetTime > windowMs) {
        rateLimitStore.delete(k);
      }
    }

    const record = rateLimitStore.get(key);

    if (!record) {
      rateLimitStore.set(key, { count: 1, resetTime: now });
      return next();
    }

    if (now - record.resetTime > windowMs) {
      record.count = 1;
      record.resetTime = now;
      return next();
    }

    record.count++;

    if (record.count > maxRequests) {
      const retryAfter = Math.ceil((record.resetTime + windowMs - now) / 1000);
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter,
      });
    }

    next();
  };
};

export default rateLimit;
