package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "修改当前用户密码")
public record ChangePasswordRequest(
    @Schema(description = "当前密码", example = "password") @NotBlank String oldPassword,
    @Schema(description = "新密码（至少 8 位）", example = "newpassword") @NotBlank @Size(min = 8)
        String newPassword) {}
