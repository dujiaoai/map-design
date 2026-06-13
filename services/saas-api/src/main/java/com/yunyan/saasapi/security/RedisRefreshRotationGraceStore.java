package com.yunyan.saasapi.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class RedisRefreshRotationGraceStore implements RefreshRotationGraceStore {

  private static final String KEY_PREFIX = "saas:refresh:grace:";

  private final StringRedisTemplate redisTemplate;
  private final ObjectMapper objectMapper;

  public RedisRefreshRotationGraceStore(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
    this.redisTemplate = redisTemplate;
    this.objectMapper = objectMapper;
  }

  @Override
  public void store(UUID userId, String consumedJti, AuthTokensDto tokens, Duration ttl) {
    redisTemplate
        .opsForValue()
        .set(key(userId, consumedJti), write(tokens), ttl);
  }

  @Override
  public Optional<AuthTokensDto> find(UUID userId, String consumedJti) {
    var raw = redisTemplate.opsForValue().get(key(userId, consumedJti));
    if (raw == null) {
      return Optional.empty();
    }
    return Optional.of(read(raw));
  }

  private static String key(UUID userId, String consumedJti) {
    return KEY_PREFIX + userId + ":" + consumedJti;
  }

  private String write(AuthTokensDto tokens) {
    try {
      return objectMapper.writeValueAsString(tokens);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize refresh grace tokens", ex);
    }
  }

  private AuthTokensDto read(String raw) {
    try {
      return objectMapper.readValue(raw, AuthTokensDto.class);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to deserialize refresh grace tokens", ex);
    }
  }
}
