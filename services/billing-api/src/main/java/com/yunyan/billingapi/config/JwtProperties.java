package com.yunyan.billingapi.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "billing.jwt")
public record JwtProperties(String issuer, String secret, Duration accessTtl) {}
