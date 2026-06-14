package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

@Schema(description = "创建租户自定义角色")
public record CreateTenantRoleRequest(
    @NotBlank
        @Size(min = 2, max = 64)
        @Pattern(regexp = "^[a-z][a-z0-9_]*$", message = "code must be lowercase snake_case")
        @Schema(description = "角色码（租户内唯一）", example = "map_editor")
        String code,
    @NotBlank @Size(max = 128) @Schema(description = "显示名") String name,
    @Size(max = 255) @Schema(description = "描述") String description,
    @Schema(description = "初始权限码") List<String> permissionCodes) {}
