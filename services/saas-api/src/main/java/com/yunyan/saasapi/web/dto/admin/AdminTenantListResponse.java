package com.yunyan.saasapi.web.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "租户列表（平台后台）")
public record AdminTenantListResponse(
    @Schema(description = "租户列表（按 name 排序）") List<AdminTenantDto> tenants,
    @Schema(description = "总条数（仅分页请求返回）") Long total,
    @Schema(description = "当前页码，从 1 开始") Integer page,
    @Schema(description = "每页条数") Integer size) {

  public static AdminTenantListResponse unpaged(List<AdminTenantDto> tenants) {
    return new AdminTenantListResponse(tenants, null, null, null);
  }

  public static AdminTenantListResponse paged(
      List<AdminTenantDto> tenants, long total, int page, int size) {
    return new AdminTenantListResponse(tenants, total, page, size);
  }
}
