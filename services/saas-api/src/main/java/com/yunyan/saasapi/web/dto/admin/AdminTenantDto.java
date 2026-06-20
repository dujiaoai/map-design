package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "平台后台 · 租户详情")
public record AdminTenantDto(
    @Schema(description = "租户 UUID") String id,
    @Schema(description = "显示名") String name,
    @Schema(description = "URL slug", example = "demo") String slug,
    @Schema(description = "订阅计划", example = "free") String plan,
    @Schema(description = "状态", allowableValues = {"active", "suspended"}) String status,
    @Schema(description = "试用结束时间，毫秒 epoch；null 表示未设置") Long trialEndsAt,
    @Schema(description = "生命周期阶段", allowableValues = {"active", "trial", "trial_expired", "suspended"})
        String onboardingPhase,
    @Schema(description = "主产品线 code", example = "map-design") String productCode,
    @Schema(description = "创建时间，毫秒 epoch") long createdAt) {}
