package com.yunyan.saasapi.web.dto.tenant;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户已开通能力码列表")
public record TenantFeaturesResponse(
    @Schema(description = "租户 ID") String tenantId,
    @Schema(
            description = "能力码，与前端 navigation tenantFeature 一致",
            example = "[\"custom.highway-alert\", \"custom.live-share\"]")
        List<String> features) {}
