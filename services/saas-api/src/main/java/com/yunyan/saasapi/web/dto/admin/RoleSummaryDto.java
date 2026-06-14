package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "SaaS 角色摘要")
public record RoleSummaryDto(
    @Schema(description = "角色 UUID") String id,
    @Schema(description = "角色码", example = "TENANT_ADMIN") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "是否系统内置角色") boolean system) {}
