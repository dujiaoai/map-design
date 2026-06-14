package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户角色摘要")
public record TenantRoleSummaryDto(
    @Schema(description = "角色 UUID") String id,
    @Schema(description = "角色码") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "描述") String description,
    @Schema(description = "是否系统角色") boolean system,
    @Schema(description = "绑定权限数") int permissionCount,
    @Schema(description = "持有成员数") int memberCount) {}
