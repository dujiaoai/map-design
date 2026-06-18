package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminUsageForecastBundleResponse(
    @Schema(description = "7 日线性预测") AdminUsageForecastResponse forecast,
    @Schema(description = "容量规划建议") List<AdminUsageCapacityRecommendation> recommendations) {}
