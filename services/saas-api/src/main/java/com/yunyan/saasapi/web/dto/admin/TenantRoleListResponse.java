package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户角色列表")
public record TenantRoleListResponse(
    @Schema(description = "角色列表") List<TenantRoleSummaryDto> roles) {}
