package com.yunyan.saasapi.security.ratelimit;

import java.time.Duration;
import java.util.OptionalLong;

public interface RateLimitStore {

  /** @return empty if allowed; otherwise seconds until the bucket resets */
  OptionalLong tryConsume(String key, int maxAttempts, Duration window);

  /** @return empty if not blocked; otherwise seconds until the bucket resets */
  OptionalLong retryAfterIfBlocked(String key, int maxAttempts, Duration window);

  void reset(String key);
}
