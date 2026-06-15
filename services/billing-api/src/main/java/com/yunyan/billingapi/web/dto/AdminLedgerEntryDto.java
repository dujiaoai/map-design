package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminLedgerEntryDto(
    UUID id,
    UUID walletId,
    UUID tenantId,
    UUID userId,
    String entryType,
    long amount,
    long balanceAfter,
    String productCode,
    String remark,
    Instant createdAt) {}
