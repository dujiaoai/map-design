package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminUsageCapacityRecommendation(
    @Schema(description = "类别 seats|auditRetention|billingPlan") String category,
    @Schema(description = "建议 increase|decrease|hold") String action,
    @Schema(description = "预测均值") long projectedAverage,
    @Schema(description = "说明") String rationale) {}
