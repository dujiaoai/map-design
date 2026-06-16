package com.yunyan.saasapi.security.mfa;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisMfaPendingEnrollStore implements MfaPendingEnrollStore {

  private static final String KEY_PREFIX = "saas:mfa:totp:pending:";

  private final StringRedisTemplate redisTemplate;

  public RedisMfaPendingEnrollStore(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  public void store(UUID userId, String secret, Duration ttl) {
    redisTemplate.opsForValue().set(key(userId), secret, ttl);
  }

  @Override
  public Optional<String> find(UUID userId) {
    var key = key(userId);
    var secret = redisTemplate.opsForValue().get(key);
    if (secret == null) {
      return Optional.empty();
    }
    return Optional.of(secret);
  }

  @Override
  public Optional<String> consume(UUID userId) {
    var key = key(userId);
    var secret = redisTemplate.opsForValue().get(key);
    if (secret == null) {
      return Optional.empty();
    }
    redisTemplate.delete(key);
    return Optional.of(secret);
  }

  @Override
  public void clear(UUID userId) {
    redisTemplate.delete(key(userId));
  }

  private static String key(UUID userId) {
    return KEY_PREFIX + userId;
  }
}
