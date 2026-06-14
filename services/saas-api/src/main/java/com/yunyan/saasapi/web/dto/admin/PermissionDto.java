package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "权限目录项")
public record PermissionDto(
    @Schema(description = "权限 UUID") String id,
    @Schema(description = "权限码", example = "admin:tenants:read") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "说明") String description,
    @Schema(description = "作用域", allowableValues = {"platform", "tenant", "workspace"})
        String scope,
    @Schema(description = "所属模块 UUID") String moduleId,
    @Schema(description = "所属模块码") String moduleCode,
    @Schema(description = "所属模块名") String moduleName,
    @Schema(description = "是否系统内置权限") boolean system) {}
