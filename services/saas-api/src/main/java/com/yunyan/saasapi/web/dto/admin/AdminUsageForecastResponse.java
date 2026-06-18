package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminUsageForecastResponse(
    @Schema(description = "新增用户预测") List<AdminUsageForecastDay> newUsers,
    @Schema(description = "审计事件预测") List<AdminUsageForecastDay> auditEvents,
    @Schema(description = "Billing API 调用预测") List<AdminUsageForecastDay> billingApiCalls) {}
