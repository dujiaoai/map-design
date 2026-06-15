package com.yunyan.billingapi.web.dto;

public record RedeemCouponResponse(
    String code, long points, long walletBalance, boolean idempotentReplay) {}
