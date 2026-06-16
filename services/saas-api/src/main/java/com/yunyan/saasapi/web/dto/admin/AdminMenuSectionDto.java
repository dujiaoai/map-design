package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Admin 工作台侧栏段")
public record AdminMenuSectionDto(
    @Schema(description = "段 id") String id,
    @Schema(description = "段标题") String label,
    @Schema(description = "是否可折叠") boolean collapsible,
    @Schema(description = "默认展开") boolean defaultOpen,
    @Schema(description = "localStorage 持久化键") String storageKey,
    @Schema(description = "排序") int sortOrder,
    @Schema(description = "是否启用") boolean enabled,
    @Schema(description = "段内菜单项") List<AdminMenuItemDto> items) {}
