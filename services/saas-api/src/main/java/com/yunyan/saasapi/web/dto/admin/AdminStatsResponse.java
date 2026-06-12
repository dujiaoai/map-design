package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "平台运营概览统计")
public record AdminStatsResponse(
    @Schema(description = "租户总数") long tenantCount,
    @Schema(description = "用户总数（跨租户）") long userCount,
    @Schema(description = "状态为 active 的租户数") long activeTenantCount) {}
