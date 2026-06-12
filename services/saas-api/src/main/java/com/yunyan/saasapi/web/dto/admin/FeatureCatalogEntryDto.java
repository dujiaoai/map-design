package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "租户能力码目录项")
public record FeatureCatalogEntryDto(
    @Schema(description = "能力码", example = "custom.highway-alert") String code,
    @Schema(description = "显示名") String name,
    @Schema(description = "说明") String description) {}
