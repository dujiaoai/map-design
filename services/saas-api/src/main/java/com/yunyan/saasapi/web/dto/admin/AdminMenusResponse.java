package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Admin 工作台菜单模板")
public record AdminMenusResponse(
    @Schema(description = "侧栏段") List<AdminMenuSectionDto> sections,
    @Schema(description = "命令面板 map-tool 项") List<AdminMenuItemDto> toolItems) {}
