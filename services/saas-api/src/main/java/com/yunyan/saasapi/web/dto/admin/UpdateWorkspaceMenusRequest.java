package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "批量更新工作台菜单模板")
public record UpdateWorkspaceMenusRequest(
    @NotNull @Valid @Schema(description = "侧栏段") List<AdminMenuSectionUpdateDto> sections,
    @NotNull @Valid @Schema(description = "命令面板 map-tool 项") List<AdminMenuItemUpdateDto> toolItems) {}
