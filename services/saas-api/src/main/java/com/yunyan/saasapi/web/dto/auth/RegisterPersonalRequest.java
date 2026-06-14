package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "自助注册个人版（隐式 personal 租户）")
public record RegisterPersonalRequest(
    @Schema(description = "邮箱", example = "solo@example.com") @NotBlank @Email String email,
    @Schema(description = "明文密码（至少 8 位）", example = "Password1") @NotBlank @Size(min = 8)
        String password,
    @Schema(description = "显示名；省略时取邮箱 @ 前部分", example = "张三") @Size(max = 128)
        String displayName) {}
