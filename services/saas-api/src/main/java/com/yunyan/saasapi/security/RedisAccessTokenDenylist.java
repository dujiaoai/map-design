package com.yunyan.saasapi.security;

import java.time.Duration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@Profile("!test")
public class RedisAccessTokenDenylist implements AccessTokenDenylist {

  private static final String KEY_PREFIX = "saas:access-deny:";

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

  private static String key(String jti) {
    return KEY_PREFIX + jti;
  }
}
