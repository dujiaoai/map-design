package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "权限模块列表")
public record PermissionModuleListResponse(
    @Schema(description = "模块（含权限项）") List<PermissionModuleDto> modules) {}
