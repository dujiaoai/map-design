package com.yunyan.billingapi.web.dto;

import java.time.Instant;
import java.util.UUID;

public record AdminRechargeOrderDto(
    String orderNo,
    UUID tenantId,
    UUID userId,
    String status,
    String channel,
    long points,
    long listPriceCents,
    long priceCents,
    String couponCode,
    long couponDiscountCents,
    String currency,
    String providerTradeNo,
    Instant paidAt,
    Instant createdAt) {}
