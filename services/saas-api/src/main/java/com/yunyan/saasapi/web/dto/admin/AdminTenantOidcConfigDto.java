package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantOidcConfigDto(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "是否启用租户 SSO") boolean enabled,
    @Schema(description = "登录按钮展示名") String displayName,
    @Schema(description = "IdP issuer URI") String issuerUri,
    @Schema(description = "OAuth client_id（不含 secret）") String clientId,
    @Schema(description = "是否已配置 issuer + client") boolean configured) {}
