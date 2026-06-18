package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantSamlIdpHealthDto(
    @Schema(description = "IdP Entity ID") String idpEntityId,
    @Schema(description = "SSO URL") String ssoUrl,
    @Schema(description = "SSO URL 可达") boolean ssoReachable,
    @Schema(description = "metadata 新鲜度") boolean metadataFresh,
    @Schema(description = "综合健康") boolean healthy,
    @Schema(description = "primary | federation") String source) {}
