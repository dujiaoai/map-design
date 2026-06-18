package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminUsageForecastDay(
    @Schema(description = "日期 YYYY-MM-DD") String date,
    @Schema(description = "指标名") String metric,
    @Schema(description = "预测值") long projectedValue) {}
