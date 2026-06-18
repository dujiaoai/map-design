package com.yunyan.saasapi.web.dto.admin;

public record AdminAuditWebhookTargetDto(
    String id, String url, String format, boolean enabled, int priority, long createdAt) {}
