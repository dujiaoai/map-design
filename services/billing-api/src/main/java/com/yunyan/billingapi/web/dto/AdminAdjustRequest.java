package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminAdjustRequest(
    @NotNull UUID userId,
    @NotNull Long amount,
    @NotBlank String remark,
    @NotBlank String idempotencyKey) {}
