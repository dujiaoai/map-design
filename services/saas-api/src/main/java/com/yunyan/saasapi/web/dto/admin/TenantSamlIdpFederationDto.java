package com.yunyan.saasapi.web.dto.admin;

public record TenantSamlIdpFederationDto(
    String id,
    String tenantId,
    String idpEntityId,
    String ssoUrl,
    boolean hasCertificate,
    int priority,
    boolean enabled,
    long createdAt,
    long updatedAt) {}
