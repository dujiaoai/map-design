package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "权限模块")
public record PermissionModuleDto(
    @Schema(description = "模块 UUID") String id,
    @Schema(description = "模块码", example = "map_tools") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "说明") String description,
    @Schema(description = "作用域", allowableValues = {"platform", "tenant", "workspace"})
        String scope,
    @Schema(description = "是否系统内置模块") boolean system,
    @Schema(description = "排序") int sortOrder,
    @Schema(description = "模块下权限项") List<PermissionDto> permissions) {}
