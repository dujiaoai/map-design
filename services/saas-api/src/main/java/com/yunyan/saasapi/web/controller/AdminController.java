package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminStatsService;
import com.yunyan.saasapi.application.admin.TenantFeatureAdminService;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminStatsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
public class AdminController {

  private final AdminStatsService adminStatsService;
  private final TenantFeatureAdminService tenantFeatureAdminService;

  @GetMapping("/ping")
  @Operation(
      summary = "Admin API 健康检查",
      description =
          """
          无需鉴权即可探测 Admin 路由是否可达。
          若携带 Bearer access token，响应会附带 `authenticated` 与 `platformAdmin` 供联调自检。
          其它 `/v1/admin/*` 接口仍需 platform 权限。
          """)
  public Map<String, Object> ping(@AuthenticationPrincipal SaasPrincipal principal) {
    var body = new LinkedHashMap<String, Object>();
    body.put("status", "ok");
    if (principal == null) {
      body.put("authenticated", false);
      body.put("platformAdmin", false);
      return body;
    }
    body.put("authenticated", true);
    body.put(
        "platformAdmin",
        principal.permissionCodes().contains(PermissionCodes.ADMIN_TENANTS_READ));
    return body;
  }

  @GetMapping("/stats")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "运营概览统计", description = "租户总数、用户总数、活跃租户数")
  public AdminStatsResponse stats() {
    return adminStatsService.getStats();
  }

  @GetMapping("/feature-catalog")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "租户能力码目录", description = "可开通模块能力列表，与 saas-web tenantFeature 对齐")
  public FeatureCatalogResponse featureCatalog() {
    return tenantFeatureAdminService.getCatalog();
  }
}
