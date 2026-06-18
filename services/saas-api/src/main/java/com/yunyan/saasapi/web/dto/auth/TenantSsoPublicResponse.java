package com.yunyan.saasapi.web.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户 SSO 公开摘要（登录页用，不含 secret）")
public record TenantSsoPublicResponse(
    @Schema(description = "租户 slug") String tenantSlug,
    @Schema(description = "是否启用租户 SSO") boolean enabled,
    @Schema(description = "登录按钮展示名") String displayName,
    @Schema(description = "Issuer 与 clientId 已配置，可展示入口") boolean loginAvailable) {}
