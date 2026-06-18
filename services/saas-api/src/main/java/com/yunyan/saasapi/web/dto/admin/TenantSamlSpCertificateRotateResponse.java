package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record TenantSamlSpCertificateRotateResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "SP 证书到期 epoch millis") long spCertificateExpiresAt) {}
