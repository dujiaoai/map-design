package com.yunyan.billingapi.security;

import java.time.Duration;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class NoopAccessTokenDenylist implements AccessTokenDenylist {

  @Override
  public void deny(String jti, Duration ttl) {}

  @Override
  public boolean isDenied(String jti) {
    return false;
  }

  @Override
  public void denyUser(UUID userId, Duration ttl) {}

  @Override
  public boolean isUserDenied(UUID userId) {
    return false;
  }

  @Override
  public void clearUserDeny(UUID userId) {}
}
