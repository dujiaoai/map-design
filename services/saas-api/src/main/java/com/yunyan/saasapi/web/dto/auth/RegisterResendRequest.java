package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "重发注册验证邮件")
public record RegisterResendRequest(
    @NotBlank @Email @Schema(description = "注册邮箱") String email,
    @NotBlank @Schema(description = "租户 slug") String tenantId) {}
