package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record PostTenantMenuOverrideBatchRequest(
    @Schema(description = "批量覆盖项") @NotEmpty @Valid List<PutTenantMenuOverrideRequest> overrides) {}
