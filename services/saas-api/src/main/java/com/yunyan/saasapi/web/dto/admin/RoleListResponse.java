package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "角色列表")
public record RoleListResponse(
    @Schema(description = "全部角色（按 code 排序）") List<RoleSummaryDto> roles) {}
