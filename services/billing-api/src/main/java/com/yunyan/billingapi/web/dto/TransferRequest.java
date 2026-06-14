package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TransferRequest(
    @NotNull UUID toUserId,
    @NotNull @Min(1) Long amount,
    String remark,
    @NotBlank String idempotencyKey) {}
