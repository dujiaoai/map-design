package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "角色已绑定的权限")
public record RolePermissionsResponse(
    @Schema(description = "角色 UUID") String roleId,
    @Schema(description = "角色码", example = "MEMBER") String roleCode,
    @Schema(description = "已绑定权限（按 code 排序）") List<PermissionDto> permissions) {}
