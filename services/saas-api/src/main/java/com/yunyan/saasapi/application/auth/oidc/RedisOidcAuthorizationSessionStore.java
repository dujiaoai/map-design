package com.yunyan.saasapi.application.auth.oidc;

import java.time.Duration;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisOidcAuthorizationSessionStore implements OidcAuthorizationSessionStore {

  private static final String KEY_PREFIX = "saas:oidc:auth:session:";

  private final StringRedisTemplate redisTemplate;
  private final OidcAuthorizationSessionCodec codec;

  public RedisOidcAuthorizationSessionStore(
      StringRedisTemplate redisTemplate, OidcAuthorizationSessionCodec codec) {
    this.redisTemplate = redisTemplate;
    this.codec = codec;
  }

  @Override
  public void store(OidcAuthorizationSession session, Duration ttl) {
    redisTemplate
        .opsForValue()
        .set(key(session.state()), codec.encode(session), ttl);
  }

  @Override
  public Optional<OidcAuthorizationSession> consume(String state) {
    var raw = redisTemplate.opsForValue().get(key(state));
    if (raw == null) {
      return Optional.empty();
    }
    redisTemplate.delete(key(state));
    return Optional.of(codec.decode(raw));
  }

  private static String key(String state) {
    return KEY_PREFIX + state;
  }
}
