package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantSamlConfigDto(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "是否启用 SAML SSO") boolean enabled,
    @Schema(description = "IdP Entity ID") String entityId,
    @Schema(description = "IdP SSO URL") String ssoUrl,
    @Schema(description = "SP ACS URL") String acsUrl,
    @Schema(description = "SP Entity ID") String spEntityId,
    @Schema(description = "是否已配置 IdP 证书") boolean certificateConfigured,
    @Schema(description = "是否已填写 IdP entity_id + sso_url") boolean configured) {}
