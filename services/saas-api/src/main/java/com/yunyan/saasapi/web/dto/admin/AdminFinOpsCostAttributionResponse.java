package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminFinOpsCostAttributionResponse(
    double totalEstimatedMonthlyCostUsd,
    double billingApiCostUsd,
    double seatCostUsd,
    double storageCostUsd,
    List<AdminFinOpsTenantConsumer> topConsumers) {}
