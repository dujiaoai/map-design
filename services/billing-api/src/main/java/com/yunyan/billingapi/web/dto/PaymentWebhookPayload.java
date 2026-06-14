package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PaymentWebhookPayload(
    @NotBlank String orderNo,
    String providerTradeNo,
    boolean success,
    /** Required when success=true; must match order price_cents. */
    @PositiveOrZero Long priceCents) {}
