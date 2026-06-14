package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record AdminUsageItemDto(
    UUID tenantId, UUID userId, long totalPoints, long eventCount) {}
