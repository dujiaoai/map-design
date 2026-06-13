package com.yunyan.saasapi.security.ratelimit;

import java.time.Duration;
import java.util.List;
import java.util.OptionalLong;
import java.util.concurrent.TimeUnit;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisRateLimitStore implements RateLimitStore {

  private static final String KEY_PREFIX = "saas:ratelimit:";

  private static final DefaultRedisScript<Long> CONSUME_SCRIPT =
      new DefaultRedisScript<>(
          """
          local key = KEYS[1]
          local max = tonumber(ARGV[1])
          local window = tonumber(ARGV[2])
          local current = redis.call('INCR', key)
          if current == 1 then
            redis.call('EXPIRE', key, window)
          end
          if current > max then
            local ttl = redis.call('TTL', key)
            if ttl < 1 then ttl = window end
            return ttl
          end
          return 0
          """,
          Long.class);

  private final StringRedisTemplate redisTemplate;

  public RedisRateLimitStore(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  public OptionalLong tryConsume(String key, int maxAttempts, Duration window) {
    var retryAfter =
        redisTemplate.execute(
            CONSUME_SCRIPT,
            List.of(prefixed(key)),
            String.valueOf(maxAttempts),
            String.valueOf(Math.max(1, window.getSeconds())));
    if (retryAfter == null || retryAfter == 0L) {
      return OptionalLong.empty();
    }
    return OptionalLong.of(retryAfter);
  }

  @Override
  public OptionalLong retryAfterIfBlocked(String key, int maxAttempts, Duration window) {
    var value = redisTemplate.opsForValue().get(prefixed(key));
    if (value == null) {
      return OptionalLong.empty();
    }
    var count = parseCount(value);
    if (count < maxAttempts) {
      return OptionalLong.empty();
    }
    var ttl = redisTemplate.getExpire(prefixed(key), TimeUnit.SECONDS);
    if (ttl == null || ttl <= 0) {
      return OptionalLong.of(Math.max(1, window.getSeconds()));
    }
    return OptionalLong.of(ttl);
  }

  @Override
  public void reset(String key) {
    redisTemplate.delete(prefixed(key));
  }

  private static String prefixed(String key) {
    return KEY_PREFIX + key;
  }

  private static int parseCount(String value) {
    try {
      return Integer.parseInt(value);
    } catch (NumberFormatException ex) {
      return 0;
    }
  }
}
