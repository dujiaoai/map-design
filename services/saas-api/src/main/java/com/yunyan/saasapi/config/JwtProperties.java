package com.yunyan.saasapi.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saas.jwt")
public record JwtProperties(
    String issuer,
    String secret,
    Duration accessTtl,
    Duration refreshTtl,
    Duration refreshGracePeriod,
    Integer permEpoch) {

  public Duration effectiveRefreshGracePeriod() {
    return refreshGracePeriod == null ? Duration.ofSeconds(30) : refreshGracePeriod;
  }

  /** 0 表示不校验 perm_epoch（兼容旧环境） */
  public int effectivePermEpoch() {
    if (permEpoch == null || permEpoch < 0) {
      return 0;
    }
    return permEpoch;
  }
}
