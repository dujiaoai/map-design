package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminFinOpsBudgetStatusResponse(
    @Schema(description = "月度预算 USD") double monthlyBudgetUsd,
    @Schema(description = "估算月度成本 USD") double estimatedMonthlyCostUsd,
    @Schema(description = "预算利用率 %") double utilizationPercent,
    @Schema(description = "达到告警阈值") boolean alert,
    @Schema(description = "超过预算") boolean overBudget,
    @Schema(description = "节流骨架已激活") boolean throttleActive) {}
