package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.UUID;

public record LedgerEntryDto(
    UUID id,
    String entryType,
    long amount,
    long balanceAfter,
    String productCode,
    String remark,
    Instant createdAt) {}
