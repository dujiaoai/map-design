package com.yunyan.saasapi.application.auth.oidc;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryOidcAuthorizationSessionStore implements OidcAuthorizationSessionStore {

  private final Map<String, Entry> entries = new ConcurrentHashMap<>();

  @Override
  public void store(OidcAuthorizationSession session, Duration ttl) {
    entries.put(session.state(), new Entry(session, Instant.now().plus(ttl)));
  }

  @Override
  public Optional<OidcAuthorizationSession> consume(String state) {
    var entry = entries.remove(state);
    if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
      return Optional.empty();
    }
    return Optional.of(entry.session());
  }

  private record Entry(OidcAuthorizationSession session, Instant expiresAt) {}
}
