package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户已开通能力")
public record AdminTenantFeaturesResponse(
    @Schema(description = "租户 UUID") String tenantId,
    @Schema(
            description = "已开通能力码",
            example = "[\"custom.highway-alert\", \"custom.live-share\"]")
        List<String> featureCodes) {}
