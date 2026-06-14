package com.yunyan.billing.dto;

import java.util.UUID;

public record SignupBonusRequest(
    UUID tenantId, UUID userId, String tenantKind, String idempotencyKey) {}
