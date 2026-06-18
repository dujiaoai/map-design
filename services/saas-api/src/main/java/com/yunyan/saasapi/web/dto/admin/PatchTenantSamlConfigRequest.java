package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record PatchTenantSamlConfigRequest(
    @Schema(description = "是否启用 SAML SSO") Boolean enabled,
    @Schema(description = "IdP Entity ID") String entityId,
    @Schema(description = "IdP SSO URL") String ssoUrl,
    @Schema(description = "SP ACS URL") String acsUrl,
    @Schema(description = "SP Entity ID") String spEntityId,
    @Schema(description = "IdP X.509 证书 PEM") String certificatePem) {}
