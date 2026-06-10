package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Schema(description = "邀请用户加入租户")
public record InviteUserRequest(
    @NotNull @Schema(description = "目标租户 UUID") UUID tenantId,
    @NotBlank @Email @Schema(description = "用户邮箱", example = "member@demo.local") String email,
    @NotBlank @Size(min = 8) @Schema(description = "初始密码（至少 8 位）") String password,
    @Size(max = 128) @Schema(description = "显示名；省略时取邮箱 @ 前部分") String displayName,
    @Pattern(regexp = "TENANT_ADMIN|MEMBER|VIEWER", message = "roleCode must be TENANT_ADMIN, MEMBER, or VIEWER")
        @Schema(
            description = "初始角色，默认 MEMBER",
            allowableValues = {"TENANT_ADMIN", "MEMBER", "VIEWER"},
            example = "MEMBER")
        String roleCode) {}
