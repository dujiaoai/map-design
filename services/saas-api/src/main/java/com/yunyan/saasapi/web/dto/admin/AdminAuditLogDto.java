package com.yunyan.saasapi.web.dto.admin;

public record AdminAuditLogDto(
    String id,
    String actorUserId,
    String actorEmail,
    String action,
    String resourceType,
    String resourceId,
    String targetTenantId,
    boolean crossTenant,
    String detail,
    long createdAt) {}
