package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminTenantMenuDiffResponse(
    @Schema(description = "租户 id") String tenantId,
    @Schema(description = "模板项与覆盖 diff") List<AdminTenantMenuDiffEntryDto> entries) {}
