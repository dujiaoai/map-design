package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantMenuDiffEntryDto(
    @Schema(description = "菜单项 id") String itemId,
    @Schema(description = "平台模板标题") String templateTitle,
    @Schema(description = "平台模板启用") boolean templateEnabled,
    @Schema(description = "平台模板 sortOrder") Integer templateSortOrder,
    @Schema(description = "是否有租户覆盖") boolean hasOverride,
    @Schema(description = "覆盖启用；null 表示继承") Boolean overrideEnabled,
    @Schema(description = "覆盖标题") String overrideTitle,
    @Schema(description = "覆盖 sortOrder；null 表示继承") Integer overrideSortOrder) {}
