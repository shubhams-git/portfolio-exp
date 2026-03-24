export type ContactRateLimitOutcome = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
};

export type ContactRateLimiter = {
  check(identifier: string, now?: number): ContactRateLimitOutcome;
};

type RateLimitState = {
  count: number;
  windowStart: number;
};

export function createFixedWindowRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): ContactRateLimiter {
  const stateByIdentifier = new Map<string, RateLimitState>();

  return {
    check(identifier: string, now = Date.now()) {
      const existingState = stateByIdentifier.get(identifier);

      if (!existingState || now - existingState.windowStart >= windowMs) {
        stateByIdentifier.set(identifier, {
          count: 1,
          windowStart: now,
        });

        return {
          allowed: true,
          limit,
          remaining: Math.max(0, limit - 1),
          resetAt: now + windowMs,
        };
      }

      if (existingState.count >= limit) {
        const resetAt = existingState.windowStart + windowMs;

        return {
          allowed: false,
          limit,
          remaining: 0,
          resetAt,
          retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        };
      }

      existingState.count += 1;

      return {
        allowed: true,
        limit,
        remaining: Math.max(0, limit - existingState.count),
        resetAt: existingState.windowStart + windowMs,
      };
    },
  };
}
