package com.yunyan.billingapi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "billing.tenant-rls")
public record TenantRlsProperties(boolean enabled) {}
