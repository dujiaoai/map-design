package com.yunyan.billingapi.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "billing.jwt")
public record JwtProperties(String issuer, String secret, Duration accessTtl, Integer permEpoch) {

  /** 0 表示不校验 perm_epoch（兼容旧环境） */
  public int effectivePermEpoch() {
    if (permEpoch == null || permEpoch < 0) {
      return 0;
    }
    return permEpoch;
  }
}
