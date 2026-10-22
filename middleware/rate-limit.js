// A small in-memory limiter, one counter per client address. It resets when the
// server restarts, which is fine for a single instance.
module.exports = function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [key, entry] of hits) if (entry.resetAt < now) hits.delete(key);
    }

    const entry = hits.get(req.ip);
    if (!entry || entry.resetAt < now) {
      hits.set(req.ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        message: "Too many attempts. Please wait a few minutes and try again.",
        field: "form",
      });
    }
    next();
  };
};
