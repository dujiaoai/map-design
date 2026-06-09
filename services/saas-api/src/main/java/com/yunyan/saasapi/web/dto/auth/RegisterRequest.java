package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "邮箱密码注册请求（加入已有租户）")
public record RegisterRequest(
    @Schema(description = "用户邮箱", example = "newuser@demo.local")
        @NotBlank
        @Email
        String email,
    @Schema(description = "明文密码（至少 8 位）", example = "password") @NotBlank @Size(min = 8)
        String password,
    @Schema(description = "目标租户 slug", example = "demo") @NotBlank String tenantId,
    @Schema(description = "显示名；省略时取邮箱 @ 前部分", example = "New User") String displayName) {}
