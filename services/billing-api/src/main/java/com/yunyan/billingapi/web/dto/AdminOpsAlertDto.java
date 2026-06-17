package com.yunyan.billingapi.web.dto;

import java.time.Instant;

public record AdminOpsAlertDto(
    String id,
    String alertType,
    String severity,
    String referenceKey,
    String title,
    String body,
    Instant resolvedAt,
    Instant createdAt) {}
