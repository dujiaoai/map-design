package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Admin 工作台菜单项")
public record AdminMenuItemDto(
    @Schema(description = "菜单项 id") String id,
    @Schema(description = "所属段 id；null 表示命令面板工具") String sectionId,
    @Schema(description = "展示标题") String title,
    @Schema(description = "行为类型") String kind,
    @Schema(description = "Lucide 图标名") String icon,
    @Schema(description = "kind=map-tool") String toolId,
    @Schema(description = "kind=map-module | map-dock-module") String moduleId,
    @Schema(description = "kind=route") String url,
    @Schema(description = "kind=external") String href,
    @Schema(description = "租户能力门控码（只读）") String tenantFeature,
    @Schema(description = "RBAC permission 门控码（只读）") String permissionCode,
    @Schema(description = "排序") int sortOrder,
    @Schema(description = "是否启用") boolean enabled) {}
