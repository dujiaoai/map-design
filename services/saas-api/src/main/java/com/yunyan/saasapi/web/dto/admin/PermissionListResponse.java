package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "权限目录")
public record PermissionListResponse(
    @Schema(description = "全部权限（按 code 排序）") List<PermissionDto> permissions) {}
