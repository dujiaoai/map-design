package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminAdjustRecordDto(
    UUID id,
    UUID walletId,
    UUID tenantId,
    UUID userId,
    long amount,
    long balanceAfter,
    String remark,
    String idempotencyKey,
    Instant createdAt) {}
