package com.yunyan.saasapi.web.dto.navigation;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "工作台侧栏分段")
public record MenuSectionDto(
    @Schema(description = "段 id") String id,
    @Schema(description = "段标题") String label,
    @Schema(description = "是否可折叠") boolean collapsible,
    @Schema(description = "默认展开") boolean defaultOpen,
    @Schema(description = "localStorage 持久化键") String storageKey,
    @Schema(description = "已按租户能力过滤的菜单项") List<MenuItemDto> items) {}
