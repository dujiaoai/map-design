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
public class InMemoryMfaLoginChallengeStore implements MfaLoginChallengeStore {

  private final Map<String, Entry> entries = new ConcurrentHashMap<>();

  @Override
  public void store(String challengeToken, UUID userId, Duration ttl) {
    entries.put(challengeToken, new Entry(userId, Instant.now().plus(ttl)));
  }

  @Override
  public Optional<UUID> consume(String challengeToken) {
    var entry = entries.remove(challengeToken);
    if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
      return Optional.empty();
    }
    return Optional.of(entry.userId());
  }

  private record Entry(UUID userId, Instant expiresAt) {}
}
