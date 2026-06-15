package com.yunyan.billingapi.web.dto;

import java.time.Instant;

public record RechargeOrderResponse(
    String orderNo,
    String status,
    String channel,
    long points,
    long listPriceCents,
    long priceCents,
    String currency,
    String couponCode,
    long couponDiscountCents,
    String payUrl,
    String payScene,
    Instant expireAt,
    Instant paidAt,
    long walletBalance) {}
