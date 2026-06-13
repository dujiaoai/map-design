package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "更新当前用户资料")
public record UpdateUserRequest(
    @Schema(description = "显示名", example = "Updated Name") @NotBlank @Size(max = 128)
        String name,
    @Schema(description = "手机号（可选）", example = "13800138000") @Size(max = 32)
        String phone,
    @Schema(description = "头像 URL（可选）", example = "https://cdn.example/avatar.png")
        @Size(max = 512)
        String avatarUrl) {}
