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
    @Schema(description = "IdP metadata URL") String metadataUrl,
    @Schema(description = "是否已配置 SP 签名证书") boolean spCertificateConfigured,
    @Schema(description = "SP 证书到期 epoch millis") Long spCertificateExpiresAt,
    @Schema(description = "IdP 证书到期 epoch millis") Long idpCertExpiresAt,
    @Schema(description = "是否启用 metadata 自动同步") boolean metadataSyncEnabled,
    @Schema(description = "上次 metadata 同步 epoch millis") Long lastMetadataSyncAt,
    @Schema(description = "是否已填写 IdP entity_id + sso_url") boolean configured) {}
