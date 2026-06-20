package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Admin 侧栏导航项")
public record AdminNavigationItemDto(
    @Schema(description = "路由路径") String to,
    @Schema(description = "显示标签") String label,
    @Schema(description = "权限码门控") List<String> permissions) {}
