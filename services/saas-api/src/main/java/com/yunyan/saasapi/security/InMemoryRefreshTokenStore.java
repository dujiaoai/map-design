package com.yunyan.saasapi.security;

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
public class InMemoryRefreshTokenStore implements RefreshTokenStore {

  private final Map<UUID, Entry> tokens = new ConcurrentHashMap<>();

  @Override
  public void store(UUID userId, String jti, Duration ttl) {
    tokens.put(userId, new Entry(jti, Instant.now().plus(ttl)));
  }

  @Override
  public boolean isActive(UUID userId, String jti) {
    var entry = tokens.get(userId);
    return entry != null && !entry.isExpired() && entry.jti().equals(jti);
  }

  @Override
  public void revoke(UUID userId, String jti) {
    var entry = tokens.get(userId);
    if (entry != null && entry.jti().equals(jti)) {
      tokens.remove(userId);
    }
  }

  @Override
  public synchronized boolean revokeIfMatches(UUID userId, String jti) {
    var entry = tokens.get(userId);
    if (entry == null || entry.isExpired() || !entry.jti().equals(jti)) {
      return false;
    }
    tokens.remove(userId);
    return true;
  }

  @Override
  public Optional<String> findActiveJti(UUID userId) {
    var entry = tokens.get(userId);
    if (entry == null || entry.isExpired()) {
      return Optional.empty();
    }
    return Optional.of(entry.jti());
  }

  private record Entry(String jti, Instant expiresAt) {
    boolean isExpired() {
      return Instant.now().isAfter(expiresAt);
    }
  }
}
