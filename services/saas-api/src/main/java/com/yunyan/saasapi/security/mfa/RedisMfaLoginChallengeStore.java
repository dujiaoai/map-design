package com.yunyan.saasapi.security.mfa;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisMfaLoginChallengeStore implements MfaLoginChallengeStore {

  private static final String KEY_PREFIX = "saas:mfa:login:challenge:";

  private final StringRedisTemplate redisTemplate;

  public RedisMfaLoginChallengeStore(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  public void store(String challengeToken, UUID userId, Duration ttl) {
    redisTemplate.opsForValue().set(key(challengeToken), userId.toString(), ttl);
  }

  @Override
  public Optional<UUID> consume(String challengeToken) {
    var raw = redisTemplate.opsForValue().get(key(challengeToken));
    if (raw == null) {
      return Optional.empty();
    }
    redisTemplate.delete(key(challengeToken));
    return Optional.of(UUID.fromString(raw));
  }

  private static String key(String challengeToken) {
    return KEY_PREFIX + challengeToken;
  }
}
