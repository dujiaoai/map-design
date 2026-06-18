package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;

public record AdminTenantMenuOverrideDto(
    @Schema(description = "覆盖记录 ID") String id,
    @Schema(description = "租户 ID") String tenantId,
    @Schema(description = "平台菜单项 id") String itemId,
    @Schema(description = "覆盖 enabled；null 表示继承模板") Boolean enabled,
    @Schema(description = "覆盖 sortOrder") Integer sortOrder,
    @Schema(description = "覆盖标题") String title) {}
