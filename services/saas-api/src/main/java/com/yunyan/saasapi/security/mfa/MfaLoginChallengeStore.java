package com.yunyan.saasapi.security.mfa;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

public interface MfaLoginChallengeStore {

  void store(String challengeToken, UUID userId, Duration ttl);

  Optional<UUID> consume(String challengeToken);
}
