package com.yunyan.saasapi.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryAccessTokenDenylist implements AccessTokenDenylist {

  private final Map<String, Instant> denied = new ConcurrentHashMap<>();
  private final Map<UUID, Instant> deniedUsers = new ConcurrentHashMap<>();

  @Override
  public void deny(String jti, Duration ttl) {
    if (jti == null || jti.isBlank()) {
      return;
    }
    var effectiveTtl = ttl.isNegative() ? Duration.ZERO : ttl;
    denied.put(jti, Instant.now().plus(effectiveTtl));
  }

  @Override
  public boolean isDenied(String jti) {
    if (jti == null || jti.isBlank()) {
      return false;
    }
    var expiresAt = denied.get(jti);
    if (expiresAt == null) {
      return false;
    }
    if (Instant.now().isAfter(expiresAt)) {
      denied.remove(jti);
      return false;
    }
    return true;
  }

  @Override
  public void denyUser(UUID userId, Duration ttl) {
    if (userId == null) {
      return;
    }
    var effectiveTtl = ttl.isNegative() ? Duration.ZERO : ttl;
    deniedUsers.put(userId, Instant.now().plus(effectiveTtl));
  }

  @Override
  public boolean isUserDenied(UUID userId) {
    if (userId == null) {
      return false;
    }
    var expiresAt = deniedUsers.get(userId);
    if (expiresAt == null) {
      return false;
    }
    if (Instant.now().isAfter(expiresAt)) {
      deniedUsers.remove(userId);
      return false;
    }
    return true;
  }

  /** Clears all entries; used by integration tests only. */
  public void resetForTests() {
    denied.clear();
    deniedUsers.clear();
  }
}
