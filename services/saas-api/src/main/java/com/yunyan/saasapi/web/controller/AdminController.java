package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminUsageBudgetAlertService;
import com.yunyan.saasapi.application.admin.AdminFinOpsService;
import com.yunyan.saasapi.application.admin.AdminStatsService;
import com.yunyan.saasapi.application.admin.AdminSystemDependenciesService;
import com.yunyan.saasapi.application.admin.AdminSystemFlagsService;
import com.yunyan.saasapi.application.admin.AdminObjectStoragePolicyService;
import com.yunyan.saasapi.application.admin.AdminUsageAnomalyService;
import com.yunyan.saasapi.application.admin.AdminUsageCapacityRecommendationService;
import com.yunyan.saasapi.application.admin.AdminUsageForecastService;
import com.yunyan.saasapi.application.admin.AdminUsageTrendsService;
import com.yunyan.saasapi.application.admin.TenantFeatureAdminService;
import com.yunyan.saasapi.application.storage.ObjectStorageConsistencyCheckService;
import com.yunyan.saasapi.application.storage.ObjectStorageRpoMonitorService;
import com.yunyan.saasapi.application.storage.ObjectStorageDrDrillService;
import com.yunyan.saasapi.web.dto.admin.FeatureCatalogResponse;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminStatsResponse;
import com.yunyan.saasapi.web.dto.admin.AdminSystemDependenciesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminSystemFlagsResponse;
import com.yunyan.saasapi.web.dto.admin.AdminObjectStoragePolicyResponse;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsBudgetStatusResponse;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsCostAttributionResponse;
import com.yunyan.saasapi.web.dto.admin.AdminObjectStorageRpoResponse;
import com.yunyan.saasapi.web.dto.admin.AdminUsageAnomaliesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminUsageForecastBundleResponse;
import com.yunyan.saasapi.web.dto.admin.AdminUsageTrendsResponse;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageConsistencyCheckResponse;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageConsistencyStatusResponse;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageDrDrillResponse;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
public class AdminController {

  private final AdminStatsService adminStatsService;
  private final AdminUsageTrendsService adminUsageTrendsService;
  private final AdminUsageAnomalyService adminUsageAnomalyService;
  private final AdminUsageForecastService adminUsageForecastService;
  private final AdminUsageCapacityRecommendationService adminUsageCapacityRecommendationService;
  private final AdminObjectStoragePolicyService adminObjectStoragePolicyService;
  private final ObjectStorageDrDrillService objectStorageDrDrillService;
  private final ObjectStorageRpoMonitorService objectStorageRpoMonitorService;
  private final ObjectStorageConsistencyCheckService objectStorageConsistencyCheckService;
  private final AdminFinOpsService adminFinOpsService;
  private final AdminUsageBudgetAlertService budgetAlertService;
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

  @GetMapping("/stats/usage-anomalies")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "用量异常检测", description = "Phase 13-4：当日指标超过 7 日均值 2 倍")
  public AdminUsageAnomaliesResponse usageAnomalies() {
    return adminUsageAnomalyService.detectAnomalies();
  }

  @GetMapping("/stats/usage-forecast")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "用量预测与容量建议", description = "Phase 14-4：7 日线性外推 + 容量规划建议")
  public AdminUsageForecastBundleResponse usageForecast() {
    return new AdminUsageForecastBundleResponse(
        adminUsageForecastService.forecast(), adminUsageCapacityRecommendationService.recommend());
  }

  @GetMapping("/stats/finops")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "FinOps 成本归因", description = "Phase 15-4：按租户估算月度成本")
  public AdminFinOpsCostAttributionResponse finOps() {
    return adminFinOpsService.attributeCosts();
  }

  @GetMapping("/stats/finops/budget-status")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "FinOps 预算状态", description = "Phase 16-4：估算成本 vs 月度预算")
  public AdminFinOpsBudgetStatusResponse finOpsBudgetStatus() {
    return budgetAlertService.getBudgetStatus();
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

  @PostMapping("/system/object-storage-dr-drill")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "对象存储 DR 演练", description = "Phase 14-5：上传样本对象并验证可读")
  public ObjectStorageDrDrillResponse objectStorageDrDrill(
      @AuthenticationPrincipal SaasPrincipal principal) {
    return objectStorageDrDrillService.executeDrill(principal);
  }

  @GetMapping("/system/object-storage-rpo")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "对象存储 RPO 监控", description = "Phase 15-5：复制延迟与 RPO 达标")
  public AdminObjectStorageRpoResponse objectStorageRpo() {
    return objectStorageRpoMonitorService.getLatestStatus();
  }

  @PostMapping("/system/object-storage-consistency-check")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "对象存储一致性校验", description = "Phase 16-5：比对主备 ETag/大小")
  public ObjectStorageConsistencyCheckResponse objectStorageConsistencyCheck(
      @AuthenticationPrincipal SaasPrincipal principal) {
    return objectStorageConsistencyCheckService.runCheck(principal);
  }

  @GetMapping("/system/object-storage-consistency-status")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "对象存储一致性状态", description = "Phase 16-5：累计校验与不一致摘要")
  public ObjectStorageConsistencyStatusResponse objectStorageConsistencyStatus() {
    return objectStorageConsistencyCheckService.getStatus();
  }

  @GetMapping("/feature-catalog")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "租户能力码目录", description = "可开通模块能力列表；可选 product 按产品线过滤")
  public FeatureCatalogResponse featureCatalog(
      @org.springframework.web.bind.annotation.RequestParam(required = false) String product) {
    if (product != null && !product.isBlank()) {
      return tenantFeatureAdminService.getCatalogForProduct(product.trim());
    }
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
