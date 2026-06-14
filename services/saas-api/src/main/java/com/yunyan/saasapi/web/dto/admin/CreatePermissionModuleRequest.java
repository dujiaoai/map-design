package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "创建权限模块")
public record CreatePermissionModuleRequest(
    @NotBlank
        @Size(max = 64)
        @Pattern(regexp = "[a-z][a-z0-9_]*", message = "code must be lowercase alphanumeric/underscore")
        @Schema(description = "模块码", example = "map_tools")
        String code,
    @NotBlank @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 255) @Schema(description = "说明") String description,
    @NotBlank
        @Pattern(regexp = "platform|tenant|workspace")
        @Schema(description = "作用域", example = "workspace")
        String scope,
    @Schema(description = "排序，越小越靠前") Integer sortOrder) {}
