// Rate limiting for the AI endpoints.
//
// The AI provider bills per token, and the assistant endpoint is public, so an
// unthrottled loop here is a direct money leak. Three limits, all in-memory:
//   - anonymous:  per-IP sliding hour window
//   - signed in:  per-user sliding hour window (higher, since we can identify them)
//   - global:     daily ceiling on anonymous messages only, as a spend backstop
//
// Dependency-free by design. Note that in-memory is only correct for a single server
// container — if this ever scales to multiple replicas, each replica keeps its own
// counters and the effective limit multiplies. Move to Redis at that point.

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const SWEEP_MS = 10 * 60 * 1000;

/** key -> array of request timestamps, oldest first */
const hits = new Map();
let anonDailyCount = 0;
let anonDailyResetAt = Date.now() + DAY_MS;

const positiveInt = (raw, fallback) => {
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const readLimits = () => ({
  anonHourly: positiveInt(process.env.AI_ANON_HOURLY_LIMIT, 10),
  userHourly: positiveInt(process.env.AI_USER_HOURLY_LIMIT, 60),
  anonDaily: positiveInt(process.env.AI_ANON_DAILY_LIMIT, 300),
});

/** Drop timestamps older than the window, then report how many remain. */
const countInWindow = (timestamps, now, windowMs) => {
  const cutoff = now - windowMs;
  while (timestamps.length && timestamps[0] <= cutoff) timestamps.shift();
  return timestamps.length;
};

const sweep = () => {
  const now = Date.now();
  for (const [key, timestamps] of hits) {
    if (countInWindow(timestamps, now, HOUR_MS) === 0) hits.delete(key);
  }
  if (now >= anonDailyResetAt) {
    anonDailyCount = 0;
    anonDailyResetAt = now + DAY_MS;
  }
};

// Housekeeping so the Map cannot grow without bound. unref() keeps this timer from
// holding the process open on shutdown.
const sweepTimer = setInterval(sweep, SWEEP_MS);
if (typeof sweepTimer.unref === 'function') sweepTimer.unref();

/**
 * Apply the appropriate bucket. Expects optionalVerifyToken to have run first so that
 * a signed-in caller is identified and gets the per-user bucket instead of sharing
 * the anonymous one.
 */
export const aiRateLimit = (req, res, next) => {
  const limits = readLimits();
  const now = Date.now();
  const userId = req.user?.id;
  const isAuthenticated = Boolean(userId);

  const key = isAuthenticated ? `user:${userId}` : `ip:${req.ip || 'unknown'}`;
  const max = isAuthenticated ? limits.userHourly : limits.anonHourly;

  let timestamps = hits.get(key);
  if (!timestamps) {
    timestamps = [];
    hits.set(key, timestamps);
  }

  if (countInWindow(timestamps, now, HOUR_MS) >= max) {
    const retryAfterSeconds = Math.max(Math.ceil((timestamps[0] + HOUR_MS - now) / 1000), 1);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: 'Too many messages',
      error: `Rate limit reached. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
    });
  }

  if (!isAuthenticated) {
    if (now >= anonDailyResetAt) {
      anonDailyCount = 0;
      anonDailyResetAt = now + DAY_MS;
    }
    if (anonDailyCount >= limits.anonDaily) {
      res.set('Retry-After', String(Math.max(Math.ceil((anonDailyResetAt - now) / 1000), 1)));
      return res.status(429).json({
        success: false,
        message: 'Assistant unavailable',
        error: 'The assistant has reached its daily limit. Please try again tomorrow.',
      });
    }
    // Counted before the request runs, so a failed generation still consumes budget.
    // Conservative on purpose — this is a spend guard, not an accounting ledger.
    anonDailyCount += 1;
  }

  timestamps.push(now);
  return next();
};
