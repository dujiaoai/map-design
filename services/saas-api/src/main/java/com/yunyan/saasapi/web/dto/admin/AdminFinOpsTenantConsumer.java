package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminFinOpsTenantConsumer(
    String tenantId,
    String tenantName,
    double estimatedMonthlyCostUsd,
    long billingApiCalls,
    long seatCount) {}
