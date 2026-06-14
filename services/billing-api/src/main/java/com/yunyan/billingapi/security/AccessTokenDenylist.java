package com.yunyan.billingapi.security;

import java.time.Duration;
import java.util.UUID;

public interface AccessTokenDenylist {

  void deny(String jti, Duration ttl);

  boolean isDenied(String jti);

  void denyUser(UUID userId, Duration ttl);

  boolean isUserDenied(UUID userId);

  void clearUserDeny(UUID userId);
}
