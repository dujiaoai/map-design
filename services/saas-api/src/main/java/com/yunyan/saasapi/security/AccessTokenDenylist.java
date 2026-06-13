package com.yunyan.saasapi.security;

import java.time.Duration;
import java.util.UUID;

public interface AccessTokenDenylist {

  void deny(String jti, Duration ttl);

  boolean isDenied(String jti);

  /** 禁用账号等场景：在 access TTL 内拒绝该用户全部 access token */
  void denyUser(UUID userId, Duration ttl);

  boolean isUserDenied(UUID userId);

  /** 重新启用账号时清除 user 级 denylist，避免新签发的 token 仍被拒绝 */
  void clearUserDeny(UUID userId);
}
