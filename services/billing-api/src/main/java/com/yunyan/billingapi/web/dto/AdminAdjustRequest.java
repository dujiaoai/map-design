package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminAdjustRequest(
    @NotNull UUID userId,
    @NotNull @Min(-1_000_000) @Max(1_000_000) Long amount,
    @NotBlank String remark,
    @NotBlank String idempotencyKey) {}
