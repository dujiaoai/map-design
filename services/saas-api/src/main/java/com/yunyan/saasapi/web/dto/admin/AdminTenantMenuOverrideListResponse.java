package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

public record AdminTenantMenuOverrideListResponse(
    @Schema(description = "租户菜单覆盖列表") List<AdminTenantMenuOverrideDto> overrides) {}
