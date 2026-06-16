package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "Admin 菜单段更新")
public record AdminMenuSectionUpdateDto(
    @NotBlank @Schema(description = "段 id") String id,
    @NotBlank @Schema(description = "段标题") String label,
    @NotNull @Schema(description = "排序") Integer sortOrder,
    @NotNull @Schema(description = "是否启用") Boolean enabled,
    @NotNull @Valid @Schema(description = "段内菜单项") List<AdminMenuItemUpdateDto> items) {}
