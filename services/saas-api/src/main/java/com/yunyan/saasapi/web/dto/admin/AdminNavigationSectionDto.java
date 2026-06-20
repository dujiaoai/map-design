package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Admin 侧栏导航分组")
public record AdminNavigationSectionDto(
    @Schema(description = "分组 id") String id,
    @Schema(description = "分组标签") String label,
    @Schema(description = "导航项") List<AdminNavigationItemDto> items) {}
