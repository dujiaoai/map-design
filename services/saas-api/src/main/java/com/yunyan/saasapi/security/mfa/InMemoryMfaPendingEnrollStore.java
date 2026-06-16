package com.yunyan.saasapi.security.mfa;

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
public class InMemoryMfaPendingEnrollStore implements MfaPendingEnrollStore {

  private final Map<UUID, Entry> entries = new ConcurrentHashMap<>();

  @Override
  public void store(UUID userId, String secret, Duration ttl) {
    entries.put(userId, new Entry(secret, Instant.now().plus(ttl)));
  }

  @Override
  public Optional<String> find(UUID userId) {
    var entry = entries.get(userId);
    if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
      entries.remove(userId);
      return Optional.empty();
    }
    return Optional.of(entry.secret());
  }

  @Override
  public Optional<String> consume(UUID userId) {
    var entry = entries.remove(userId);
    if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
      return Optional.empty();
    }
    return Optional.of(entry.secret());
  }

  @Override
  public void clear(UUID userId) {
    entries.remove(userId);
  }

  private record Entry(String secret, Instant expiresAt) {}
}
