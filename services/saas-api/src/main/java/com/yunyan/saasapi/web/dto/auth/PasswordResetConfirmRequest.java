package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "确认密码重置")
public record PasswordResetConfirmRequest(
    @NotBlank @Schema(description = "邮件中的重置 token") String token,
    @NotBlank @Size(min = 8) @Schema(description = "新密码（至少 8 位）") String password) {}
