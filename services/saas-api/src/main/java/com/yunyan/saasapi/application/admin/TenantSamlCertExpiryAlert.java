package com.yunyan.saasapi.application.admin;

import java.time.Instant;

public record TenantSamlCertExpiryAlert(String tenantId, String certType, Instant expiresAt) {}
