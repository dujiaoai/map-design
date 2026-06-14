package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "可分配给租户成员的角色")
public record AssignableRoleDto(
    @Schema(description = "角色 UUID") String id,
    @Schema(description = "角色码") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "是否系统角色") boolean system) {}
