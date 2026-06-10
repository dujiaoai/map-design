package com.yunyan.saasapi.web.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "租户列表（平台后台）")
public record AdminTenantListResponse(
    @Schema(description = "全部租户（按 name 排序）") List<AdminTenantDto> tenants) {}
