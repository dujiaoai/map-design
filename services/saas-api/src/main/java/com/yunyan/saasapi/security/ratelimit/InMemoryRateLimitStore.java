package com.yunyan.saasapi.security.ratelimit;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.OptionalLong;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryRateLimitStore implements RateLimitStore {

  private final Map<String, Window> windows = new ConcurrentHashMap<>();

  @Override
  public OptionalLong tryConsume(String key, int maxAttempts, Duration window) {
    var now = Instant.now();
    final OptionalLong[] result = new OptionalLong[1];

    windows.compute(
        key,
        (ignored, existing) -> {
          if (existing == null || !now.isBefore(existing.expiresAt())) {
            result[0] = OptionalLong.empty();
            return new Window(1, now.plus(window));
          }
          if (existing.count >= maxAttempts) {
            result[0] = retrySeconds(now, existing.expiresAt());
            return existing;
          }
          result[0] = OptionalLong.empty();
          return new Window(existing.count + 1, existing.expiresAt);
        });

    return result[0];
  }

  @Override
  public OptionalLong retryAfterIfBlocked(String key, int maxAttempts, Duration window) {
    var existing = windows.get(key);
    if (existing == null) {
      return OptionalLong.empty();
    }
    var now = Instant.now();
    if (!now.isBefore(existing.expiresAt()) || existing.count < maxAttempts) {
      return OptionalLong.empty();
    }
    return retrySeconds(now, existing.expiresAt());
  }

  @Override
  public void reset(String key) {
    windows.remove(key);
  }

  private static OptionalLong retrySeconds(Instant now, Instant expiresAt) {
    return OptionalLong.of(Math.max(1, Duration.between(now, expiresAt).getSeconds()));
  }

  private record Window(int count, Instant expiresAt) {}
}
