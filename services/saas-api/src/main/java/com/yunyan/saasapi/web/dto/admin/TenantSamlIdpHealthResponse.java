package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.UUID;

public record TenantSamlIdpHealthResponse(
    @Schema(description = "各 IdP 健康状态") List<TenantSamlIdpHealthDto> items) {}
