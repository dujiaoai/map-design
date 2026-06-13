package com.yunyan.saasapi.security;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisRefreshTokenStore implements RefreshTokenStore {

  private static final String KEY_PREFIX = "saas:refresh:";

  private static final DefaultRedisScript<Long> REVOKE_IF_MATCHES_SCRIPT =
      new DefaultRedisScript<>(
          """
          if redis.call('GET', KEYS[1]) == ARGV[1] then
            return redis.call('DEL', KEYS[1])
          else
            return 0
          end
          """,
          Long.class);

  private final StringRedisTemplate redisTemplate;

  public RedisRefreshTokenStore(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  public void store(UUID userId, String jti, Duration ttl) {
    redisTemplate.opsForValue().set(key(userId), jti, ttl);
  }

  @Override
  public boolean isActive(UUID userId, String jti) {
    return jti.equals(redisTemplate.opsForValue().get(key(userId)));
  }

  @Override
  public void revoke(UUID userId, String jti) {
    var current = redisTemplate.opsForValue().get(key(userId));
    if (jti.equals(current)) {
      redisTemplate.delete(key(userId));
    }
  }

  @Override
  public boolean revokeIfMatches(UUID userId, String jti) {
    var deleted =
        redisTemplate.execute(
            REVOKE_IF_MATCHES_SCRIPT, List.of(key(userId)), jti);
    return deleted != null && deleted > 0L;
  }

  @Override
  public Optional<String> findActiveJti(UUID userId) {
    return Optional.ofNullable(redisTemplate.opsForValue().get(key(userId)));
  }

  private static String key(UUID userId) {
    return KEY_PREFIX + userId;
  }
}
