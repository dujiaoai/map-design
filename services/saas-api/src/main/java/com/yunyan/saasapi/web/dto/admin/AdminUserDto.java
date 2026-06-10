package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "平台后台 · 用户详情")
public record AdminUserDto(
    @Schema(description = "用户 UUID") String id,
    @Schema(description = "所属租户 UUID") String tenantId,
    @Schema(description = "租户 slug", example = "demo") String tenantSlug,
    @Schema(description = "租户显示名") String tenantName,
    @Schema(description = "邮箱") String email,
    @Schema(description = "显示名") String displayName,
    @Schema(description = "状态", allowableValues = {"active", "disabled"}) String status,
    @Schema(description = "角色码列表") List<String> roles,
    @Schema(description = "创建时间，毫秒 epoch") long createdAt) {}
