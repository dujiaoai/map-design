package com.yunyan.saasapi.security;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisRefreshTokenStore implements RefreshTokenStore {

  private static final String KEY_PREFIX = "saas:refresh:";

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
  public Optional<String> findActiveJti(UUID userId) {
    return Optional.ofNullable(redisTemplate.opsForValue().get(key(userId)));
  }

  private static String key(UUID userId) {
    return KEY_PREFIX + userId;
  }
}
