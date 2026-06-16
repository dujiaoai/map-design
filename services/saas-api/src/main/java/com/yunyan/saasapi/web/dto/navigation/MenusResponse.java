package com.yunyan.saasapi.web.dto.navigation;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "当前租户工作台菜单")
public record MenusResponse(
    @Schema(description = "侧栏分段（已过滤）") List<MenuSectionDto> sections,
    @Schema(description = "全量可见项（含 map-tool，供命令面板与 URL 解析）") List<MenuItemDto> items) {}
