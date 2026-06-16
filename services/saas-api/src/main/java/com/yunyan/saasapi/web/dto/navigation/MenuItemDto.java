package com.yunyan.saasapi.web.dto.navigation;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "工作台菜单项")
public record MenuItemDto(
    @Schema(description = "菜单项 id，与 saas-web mock-nav 对齐") String id,
    @Schema(description = "展示标题") String title,
    @Schema(
            description =
                "行为类型：map-tool | map-module | map-dock-module | route | external")
        String kind,
    @Schema(description = "Lucide 图标名（无 Icon 后缀）") String icon,
    @Schema(description = "kind=map-tool") String toolId,
    @Schema(description = "kind=map-module | map-dock-module") String moduleId,
    @Schema(description = "kind=route") String url,
    @Schema(description = "kind=external") String href) {}
