package com.yunyan.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record WalletHoldRequest(
    @NotNull UUID tenantId,
    @NotNull UUID userId,
    @NotBlank @Size(max = 64) String productCode,
    @NotBlank @Size(max = 128) String ruleCode,
    @Positive long quantity,
    @NotBlank @Size(max = 128) String idempotencyKey,
    @Size(max = 256) String bizRef) {}
