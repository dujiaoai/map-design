package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户成员可分配角色")
public record AssignableRoleListResponse(
    @Schema(description = "角色列表") List<AssignableRoleDto> roles) {}
