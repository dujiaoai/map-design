package com.yunyan.billing.dto;

import java.util.UUID;

public record WalletHoldRequest(
    UUID tenantId,
    UUID userId,
    String productCode,
    String ruleCode,
    long quantity,
    String idempotencyKey,
    String bizRef) {}
