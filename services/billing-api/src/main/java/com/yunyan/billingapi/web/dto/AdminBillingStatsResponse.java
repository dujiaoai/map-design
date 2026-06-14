package com.yunyan.billingapi.web.dto;

public record AdminBillingStatsResponse(
    long walletCount,
    long totalBalance,
    long paidRechargeOrderCount,
    long paidRechargeGmvCents,
    long pendingRechargeOrderCount) {}
