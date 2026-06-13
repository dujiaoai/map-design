package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "创建租户邀请链接")
public record CreateTenantInviteLinkRequest(
    @Pattern(regexp = "TENANT_ADMIN|MEMBER|VIEWER", message = "roleCode must be TENANT_ADMIN, MEMBER, or VIEWER")
        @Schema(
            description = "通过链接加入时的默认角色",
            allowableValues = {"TENANT_ADMIN", "MEMBER", "VIEWER"},
            example = "MEMBER")
        String roleCode,
    @Size(max = 128) @Schema(description = "链接备注，便于管理员识别") String label,
    @Min(1) @Max(10000) @Schema(description = "最大使用次数；省略表示不限") Integer maxUses,
    @Min(1) @Max(8760) @Schema(description = "有效小时数；省略时使用系统默认") Integer expiresInHours) {}
