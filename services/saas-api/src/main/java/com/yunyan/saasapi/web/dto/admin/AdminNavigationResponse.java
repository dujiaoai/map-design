package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Admin 侧栏导航")
public record AdminNavigationResponse(
    @Schema(description = "产品线 code，null 表示默认") String productCode,
    @Schema(description = "导航分组") List<AdminNavigationSectionDto> sections) {}
