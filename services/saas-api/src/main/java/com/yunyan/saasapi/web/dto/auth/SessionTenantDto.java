package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "当前租户摘要")
public record SessionTenantDto(
    @Schema(description = "租户 UUID") String id,
    @Schema(description = "租户名称", example = "Demo Tenant") String name,
    @Schema(description = "租户 slug", example = "demo") String slug) {}
