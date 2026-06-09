package com.yunyan.saasapi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "saas.tenant-rls")
public record TenantRlsProperties(boolean enabled) {}
