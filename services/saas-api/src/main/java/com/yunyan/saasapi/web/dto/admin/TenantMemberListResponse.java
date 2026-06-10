package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户成员列表")
public record TenantMemberListResponse(
    @Schema(description = "成员列表") List<AdminUserDto> members) {}
