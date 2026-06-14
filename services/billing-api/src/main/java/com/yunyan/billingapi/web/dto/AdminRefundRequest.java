package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminRefundRequest(@NotBlank String reason, @NotBlank String idempotencyKey) {}
