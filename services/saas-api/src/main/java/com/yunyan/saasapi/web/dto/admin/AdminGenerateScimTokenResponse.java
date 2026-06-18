package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminGenerateScimTokenResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "明文 token（仅本次返回）") String token,
    @Schema(description = "SCIM Users endpoint URL") String usersEndpointUrl) {}
