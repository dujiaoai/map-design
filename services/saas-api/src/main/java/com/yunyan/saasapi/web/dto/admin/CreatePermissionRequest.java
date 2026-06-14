package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "在模块下创建权限项")
public record CreatePermissionRequest(
    @NotBlank
        @Size(max = 64)
        @Pattern(
            regexp = "[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*)*",
            message = "action must be lowercase segments separated by colon")
        @Schema(description = "动作段，与模块码拼接为完整权限码", example = "layer:read")
        String action,
    @NotBlank @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 255) @Schema(description = "说明") String description) {}
