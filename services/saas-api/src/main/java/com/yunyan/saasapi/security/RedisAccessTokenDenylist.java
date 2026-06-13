package com.yunyan.saasapi.security;

import java.time.Duration;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Profile("!test")
public class RedisAccessTokenDenylist implements AccessTokenDenylist {

  private static final String KEY_PREFIX = "saas:access-deny:";
  private static final String USER_KEY_PREFIX = "saas:access-deny-user:";

  private final StringRedisTemplate redisTemplate;

  public RedisAccessTokenDenylist(StringRedisTemplate redisTemplate) {
    this.redisTemplate = redisTemplate;
  }

  @Override
  public void deny(String jti, Duration ttl) {
    if (!StringUtils.hasText(jti)) {
      return;
    }
    var effectiveTtl = ttl.isNegative() ? Duration.ZERO : ttl;
    redisTemplate.opsForValue().set(key(jti), "1", effectiveTtl);
  }

  @Override
  public boolean isDenied(String jti) {
    if (!StringUtils.hasText(jti)) {
      return false;
    }
    return Boolean.TRUE.equals(redisTemplate.hasKey(key(jti)));
  }

  @Override
  public void denyUser(UUID userId, Duration ttl) {
    if (userId == null) {
      return;
    }
    var effectiveTtl = ttl.isNegative() ? Duration.ZERO : ttl;
    redisTemplate.opsForValue().set(userKey(userId), "1", effectiveTtl);
  }

  @Override
  public boolean isUserDenied(UUID userId) {
    if (userId == null) {
      return false;
    }
    return Boolean.TRUE.equals(redisTemplate.hasKey(userKey(userId)));
  }

  @Override
  public void clearUserDeny(UUID userId) {
    if (userId == null) {
      return;
    }
    redisTemplate.delete(userKey(userId));
  }

  private static String key(String jti) {
    return KEY_PREFIX + jti;
  }

  private static String userKey(UUID userId) {
    return USER_KEY_PREFIX + userId;
  }
}
