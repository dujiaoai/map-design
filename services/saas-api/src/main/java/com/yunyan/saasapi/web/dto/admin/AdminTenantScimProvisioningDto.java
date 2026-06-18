package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantScimProvisioningDto(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "是否启用 SCIM provisioning") boolean enabled,
    @Schema(description = "是否已配置 token") boolean tokenConfigured,
    @Schema(description = "SCIM Users endpoint URL") String usersEndpointUrl,
    @Schema(description = "最后 SCIM sync 时间 epoch millis") Long lastSyncAt) {}
