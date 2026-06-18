package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminUsageDayBucket(
    @Schema(description = "日期 YYYY-MM-DD") String date,
    @Schema(description = "当日新增用户数") long newUsers,
    @Schema(description = "当日审计事件数") long auditEvents,
    @Schema(description = "当日活跃租户数（近似）") long activeTenants,
    @Schema(description = "billing-api 当日 confirmed 事件数") long billingApiCallsPerDay) {}
