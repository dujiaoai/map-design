package com.yunyan.billingapi.web.dto;

import java.time.Instant;

public record RechargeOrderResponse(
    String orderNo,
    String status,
    String channel,
    long points,
    long priceCents,
    String currency,
    String payUrl,
    Instant expireAt,
    Instant paidAt,
    long walletBalance) {}
