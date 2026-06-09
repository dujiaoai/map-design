package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "更新当前用户资料（首版仅 displayName，JSON 字段为 name）")
public record UpdateUserRequest(
    @Schema(description = "显示名", example = "Updated Name") @NotBlank @Size(max = 128)
        String name) {}
