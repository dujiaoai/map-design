package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "全量替换租户能力码")
public record UpdateTenantFeaturesRequest(
    @NotNull @Schema(description = "能力码列表，须为 catalog 子集") List<String> featureCodes) {}
