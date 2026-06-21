package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "更新租户（部分字段）")
public record PatchTenantRequest(
    @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 32) @Schema(description = "订阅计划", example = "pro") String plan,
    @Pattern(regexp = "active|suspended", message = "status must be active or suspended")
        @Schema(description = "启停状态", allowableValues = {"active", "suspended"})
        String status,
    @Schema(description = "试用结束时间，毫秒 epoch") Long trialEndsAt,
    @Schema(description = "为 true 时清除 trialEndsAt") Boolean clearTrialEndsAt,
    @Size(max = 64) @Schema(description = "所属产品线 code", example = "map-design") String productCode) {}
