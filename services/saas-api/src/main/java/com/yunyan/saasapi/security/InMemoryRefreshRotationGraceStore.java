package com.yunyan.saasapi.security;

import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryRefreshRotationGraceStore implements RefreshRotationGraceStore {

  private final Map<String, Entry> entries = new ConcurrentHashMap<>();

  @Override
  public void store(UUID userId, String consumedJti, AuthTokensDto tokens, Duration ttl) {
    entries.put(key(userId, consumedJti), new Entry(tokens, Instant.now().plus(ttl)));
  }

  @Override
  public Optional<AuthTokensDto> find(UUID userId, String consumedJti) {
    var entry = entries.get(key(userId, consumedJti));
    if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
      entries.remove(key(userId, consumedJti));
      return Optional.empty();
    }
    return Optional.of(entry.tokens());
  }

  private static String key(UUID userId, String consumedJti) {
    return userId + ":" + consumedJti;
  }

  private record Entry(AuthTokensDto tokens, Instant expiresAt) {}
}
