package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PutTenantMenuOverrideRequest(
    @NotBlank @Size(max = 64) @Schema(description = "平台菜单项 id") String itemId,
    @Schema(description = "覆盖启用状态；null 表示继承模板") Boolean enabled,
    @Schema(description = "覆盖排序；null 表示继承模板") Integer sortOrder,
    @Schema(description = "覆盖标题；null 表示继承模板") @Size(max = 128) String title) {}
