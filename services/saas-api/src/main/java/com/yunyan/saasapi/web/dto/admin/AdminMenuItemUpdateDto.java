package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Admin 菜单项更新")
public record AdminMenuItemUpdateDto(
    @NotBlank @Schema(description = "菜单项 id") String id,
    @NotBlank @Schema(description = "展示标题") String title,
    @NotNull @Schema(description = "排序") Integer sortOrder,
    @NotNull @Schema(description = "是否启用") Boolean enabled) {}
