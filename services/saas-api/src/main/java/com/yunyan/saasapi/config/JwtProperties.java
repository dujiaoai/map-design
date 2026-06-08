package com.yunyan.saasapi.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saas.jwt")
public record JwtProperties(
    String issuer,
    String secret,
    Duration accessTtl,
    Duration refreshTtl) {}
