package com.yunyan.saasapi.security;

import java.time.Duration;

public interface AccessTokenDenylist {

  void deny(String jti, Duration ttl);

  boolean isDenied(String jti);
}
