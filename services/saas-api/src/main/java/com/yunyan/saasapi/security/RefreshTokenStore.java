package com.yunyan.saasapi.security;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenStore {

  void store(UUID userId, String jti, Duration ttl);

  boolean isActive(UUID userId, String jti);

  void revoke(UUID userId, String jti);

  /** Atomically revokes only when the active token matches {@code jti}. */
  boolean revokeIfMatches(UUID userId, String jti);

  Optional<String> findActiveJti(UUID userId);
}
