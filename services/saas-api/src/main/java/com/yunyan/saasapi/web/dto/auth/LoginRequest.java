package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "邮箱密码登录请求")
public record LoginRequest(
    @Schema(description = "用户邮箱", example = "admin@demo.local")
        @NotBlank
        @Email
        String email,
    @Schema(description = "明文密码", example = "password") @NotBlank String password,
    @Schema(description = "租户 slug；同一邮箱属于多个租户时必填", example = "demo") String tenantId) {}
