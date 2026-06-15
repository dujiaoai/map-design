package com.yunyan.billingapi.web.dto;

public record AdminCouponDto(
    String id,
    String code,
    long points,
    String status,
    Integer maxTotalRedemptions,
    int redemptionCount,
    int maxPerUser,
    String validUntil,
    String createdAt) {}
