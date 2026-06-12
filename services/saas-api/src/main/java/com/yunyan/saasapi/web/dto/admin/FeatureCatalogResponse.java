package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户能力码目录")
public record FeatureCatalogResponse(
    @Schema(description = "可开通能力列表") List<FeatureCatalogEntryDto> features) {}
