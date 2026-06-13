package com.yunyan.saasapi.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("test")
public class InMemoryAccessTokenDenylist implements AccessTokenDenylist {

  private final Map<String, Instant> denied = new ConcurrentHashMap<>();

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
}
