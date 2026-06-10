package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Schema(description = "更新角色权限绑定（全量替换）")
public record UpdateRolePermissionsRequest(
    @Schema(description = "权限码列表；空数组表示清除全部绑定")
        @NotNull(message = "permissionCodes is required")
        List<String> permissionCodes) {}
