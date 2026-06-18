package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantSamlMetadataImportResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "IdP Entity ID") String entityId,
    @Schema(description = "IdP SSO URL") String ssoUrl,
    @Schema(description = "是否导入 IdP 证书") boolean certificateImported,
    @Schema(description = "导入时间 epoch millis") long importedAt) {}
