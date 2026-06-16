package com.yunyan.saasapi.security.mfa;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

public interface MfaPendingEnrollStore {

  void store(UUID userId, String secret, Duration ttl);

  Optional<String> find(UUID userId);

  Optional<String> consume(UUID userId);

  void clear(UUID userId);
}
