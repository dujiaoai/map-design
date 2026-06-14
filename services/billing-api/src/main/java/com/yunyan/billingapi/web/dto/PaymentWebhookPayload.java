package com.yunyan.billingapi.web.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentWebhookPayload(
    @NotBlank String orderNo, String providerTradeNo, boolean success) {}
