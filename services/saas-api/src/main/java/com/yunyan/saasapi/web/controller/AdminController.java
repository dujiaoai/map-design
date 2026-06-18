package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminStatsService;
import com.yunyan.saasapi.application.admin.AdminSystemDependenciesService;
import com.yunyan.saasapi.application.admin.AdminSystemFlagsService;
import com.yunyan.saasapi.application.admin.AdminObjectStoragePolicyService;
import com.yunyan.saasapi.application.admin.AdminUsageTrendsService;
import com.yunyan.saasapi.application.admin.TenantFeatureAdminService;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminStatsResponse;
import com.yunyan.saasapi.web.dto.admin.AdminSystemDependenciesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminSystemFlagsResponse;
import com.yunyan.saasapi.web.dto.admin.AdminObjectStoragePolicyResponse;
import com.yunyan.saasapi.web.dto.admin.AdminUsageTrendsResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
  private final AdminUsageTrendsService adminUsageTrendsService;
  private final AdminObjectStoragePolicyService adminObjectStoragePolicyService;
  private final AdminSystemFlagsService adminSystemFlagsService;
  private final AdminSystemDependenciesService adminSystemDependenciesService;
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

  @GetMapping("/stats/usage-trends")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "近 7 日用量趋势", description = "新增用户、审计事件、活跃租户（按日桶）")
  public AdminUsageTrendsResponse usageTrends() {
    return adminUsageTrendsService.getTrends();
  }

  @GetMapping("/stats/usage-trends/export")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "导出近 7 日用量趋势 CSV", description = "Phase 12-4")
  public ResponseEntity<byte[]> exportUsageTrends() {
    var csv = adminUsageTrendsService.exportCsv();
    var filename = "usage-trends-" + Instant.now().toString().substring(0, 10) + ".csv";
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
        .contentType(new MediaType("text", "csv", java.nio.charset.StandardCharsets.UTF_8))
        .body(csv);
  }

  @GetMapping("/system/object-storage-policy")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "对象存储策略摘要", description = "Phase 12-5：跨区复制与合规保留")
  public AdminObjectStoragePolicyResponse objectStoragePolicy() {
    return adminObjectStoragePolicyService.getPolicySummary();
  }

  @GetMapping("/feature-catalog")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "租户能力码目录", description = "可开通模块能力列表，与 saas-web tenantFeature 对齐")
  public FeatureCatalogResponse featureCatalog() {
    return tenantFeatureAdminService.getCatalog();
  }

  @GetMapping("/system/flags")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "平台配置摘要（只读）",
      description = "注册开关、邮件、限流、RLS、billing 集成等运行态摘要；不含密钥。")
  public AdminSystemFlagsResponse systemFlags() {
    return adminSystemFlagsService.getFlags();
  }

  @GetMapping("/system/dependencies")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "平台依赖健康（只读）",
      description = "saas-api 对 billing-api 等下游的实时探活摘要；对齐 FND-05 HealthIndicator。")
  public AdminSystemDependenciesResponse systemDependencies() {
    return adminSystemDependenciesService.getDependencies();
  }
}
