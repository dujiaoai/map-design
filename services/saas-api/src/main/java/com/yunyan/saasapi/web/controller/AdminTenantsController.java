package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminListParams;
import com.yunyan.saasapi.application.admin.TenantAdminService;
import com.yunyan.saasapi.application.admin.TenantDataExportAdminService;
import com.yunyan.saasapi.application.admin.TenantFeatureAdminService;
import com.yunyan.saasapi.application.admin.TenantMenuOverrideAdminService;
import com.yunyan.saasapi.application.admin.TenantOidcMetadataImportService;
import com.yunyan.saasapi.application.admin.TenantOidcAdminService;
import com.yunyan.saasapi.application.admin.TenantSamlAdminService;
import com.yunyan.saasapi.application.admin.TenantSamlIdpFederationAdminService;
import com.yunyan.saasapi.application.admin.TenantSamlDisconnectDrillService;
import com.yunyan.saasapi.application.admin.TenantSamlIdpHealthService;
import com.yunyan.saasapi.application.admin.TenantSamlIdpRegistrationService;
import com.yunyan.saasapi.application.admin.TenantSamlMetadataImportService;
import com.yunyan.saasapi.application.admin.TenantSamlSpCertificateService;
import com.yunyan.saasapi.application.scim.ScimSchemaExtensionAdminService;
import com.yunyan.saasapi.application.scim.ScimGroupMappingRuleService;
import com.yunyan.saasapi.application.admin.ScimSyncEventAdminService;
import com.yunyan.saasapi.application.admin.ScimChangePreviewService;
import com.yunyan.saasapi.application.admin.ScimProvisioningAdminService;
import com.yunyan.saasapi.application.admin.TenantStorageEstimateAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminGenerateScimTokenResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuDiffResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantOidcConfigDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlIdpApproveResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlIdpRegistrationListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminScimGroupMappingRuleListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminScimSchemaExtensionResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlConfigDto;
import com.yunyan.saasapi.web.dto.admin.ScimChangePreviewResponse;
import com.yunyan.saasapi.web.dto.admin.ScimSyncEventSummaryResponse;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportArtifactResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantStorageEstimateDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantScimProvisioningDto;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRequest;
import com.yunyan.saasapi.web.dto.admin.CreateTenantSamlIdpFederationRequest;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpFederationDto;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpFederationListResponse;
import com.yunyan.saasapi.web.dto.admin.TenantSamlDisconnectDrillRequest;
import com.yunyan.saasapi.web.dto.admin.TenantSamlDisconnectDrillResponse;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpHealthResponse;
import com.yunyan.saasapi.web.dto.admin.PatchTenantOidcConfigRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantSamlConfigRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRequest;
import com.yunyan.saasapi.web.dto.admin.PostTenantMenuOverrideBatchRequest;
import com.yunyan.saasapi.web.dto.admin.PutTenantMenuOverrideRequest;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestDto;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestListResponse;
import com.yunyan.saasapi.web.dto.admin.TenantOidcMetadataImportResponse;
import com.yunyan.saasapi.web.dto.admin.TenantSamlMetadataImportResponse;
import com.yunyan.saasapi.web.dto.admin.TenantSamlSpCertificateRotateResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateTenantFeaturesRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/tenants")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminTenantsController {

  private final TenantAdminService tenantAdminService;
  private final TenantFeatureAdminService tenantFeatureAdminService;
  private final TenantDataExportAdminService tenantDataExportAdminService;
  private final TenantOidcAdminService tenantOidcAdminService;
  private final TenantOidcMetadataImportService tenantOidcMetadataImportService;
  private final TenantSamlAdminService tenantSamlAdminService;
  private final TenantSamlMetadataImportService tenantSamlMetadataImportService;
  private final TenantSamlSpCertificateService tenantSamlSpCertificateService;
  private final TenantSamlIdpRegistrationService tenantSamlIdpRegistrationService;
  private final TenantSamlIdpFederationAdminService tenantSamlIdpFederationAdminService;
  private final TenantSamlIdpHealthService tenantSamlIdpHealthService;
  private final TenantSamlDisconnectDrillService tenantSamlDisconnectDrillService;
  private final ScimProvisioningAdminService scimProvisioningAdminService;
  private final ScimSchemaExtensionAdminService scimSchemaExtensionAdminService;
  private final ScimGroupMappingRuleService scimGroupMappingRuleService;
  private final ScimSyncEventAdminService scimSyncEventAdminService;
  private final ScimChangePreviewService scimChangePreviewService;
  private final TenantStorageEstimateAdminService tenantStorageEstimateAdminService;
  private final TenantMenuOverrideAdminService tenantMenuOverrideAdminService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(
      summary = "列出全部租户",
      description = "可选 q/page/size/sortBy/sortDir 分页搜索与排序（sortBy: name|slug|createdAt）；无分页参数时返回全量（向后兼容）")
  public AdminTenantListResponse listTenants(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sortBy,
      @RequestParam(required = false) String sortDir) {
    return tenantAdminService.listTenants(new AdminListParams(q, page, size, null, sortBy, sortDir));
  }

  @GetMapping("/{tenantId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "获取租户详情")
  public AdminTenantDto getTenant(@PathVariable UUID tenantId) {
    return tenantAdminService.getTenant(tenantId);
  }

  @GetMapping("/{tenantId}/features")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "获取租户已开通能力")
  public AdminTenantFeaturesResponse getTenantFeatures(@PathVariable UUID tenantId) {
    return tenantFeatureAdminService.getFeatures(tenantId);
  }

  @PutMapping("/{tenantId}/features")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "全量替换租户能力", description = "能力码须为 catalog 子集")
  public AdminTenantFeaturesResponse updateTenantFeatures(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody UpdateTenantFeaturesRequest request) {
    return tenantFeatureAdminService.replaceFeatures(principal, tenantId, request);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "创建租户")
  public AdminTenantDto createTenant(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateTenantRequest request) {
    return tenantAdminService.createTenant(principal, request);
  }

  @PatchMapping("/{tenantId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "更新租户", description = "可修改 name、plan、status（active/suspended）")
  public AdminTenantDto patchTenant(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody PatchTenantRequest request) {
    return tenantAdminService.patchTenant(principal, tenantId, request);
  }

  @GetMapping("/{tenantId}/data-export-requests")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "列出租户数据导出请求", description = "GDPR 式数据包导出队列（骨架）")
  public TenantDataExportRequestListResponse listDataExportRequests(@PathVariable UUID tenantId) {
    return tenantDataExportAdminService.listRequests(tenantId);
  }

  @PostMapping("/{tenantId}/data-export-requests")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "创建租户数据导出请求", description = "入队 pending 状态；异步打包待后续 Job 实现")
  public TenantDataExportRequestDto createDataExportRequest(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantDataExportAdminService.createRequest(principal, tenantId);
  }

  @GetMapping("/{tenantId}/data-export-requests/{requestId}/artifact")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "获取 GDPR 导出 artifact 元数据", description = "Phase 7-3；skeleton URL 占位")
  public TenantDataExportArtifactResponse getDataExportArtifact(
      @PathVariable UUID tenantId, @PathVariable UUID requestId) {
    return tenantDataExportAdminService.getArtifact(tenantId, requestId);
  }

  @GetMapping("/{tenantId}/oidc-config")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "获取租户 OIDC 配置（只读）", description = "Phase 5D-1 骨架；未配置时返回 enabled=false")
  public AdminTenantOidcConfigDto getOidcConfig(@PathVariable UUID tenantId) {
    return tenantOidcAdminService.getConfig(tenantId);
  }

  @GetMapping("/{tenantId}/saml-config")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "获取租户 SAML 配置", description = "Phase 11-1 SP 授权流")
  public AdminTenantSamlConfigDto getSamlConfig(@PathVariable UUID tenantId) {
    return tenantSamlAdminService.getConfig(tenantId);
  }

  @PatchMapping("/{tenantId}/saml-config")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "更新租户 SAML 配置", description = "Admin 写入 IdP/SP 字段与启用开关")
  public AdminTenantSamlConfigDto patchSamlConfig(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody PatchTenantSamlConfigRequest request) {
    return tenantSamlAdminService.patchConfig(principal, tenantId, request);
  }

  @GetMapping("/{tenantId}/scim-provisioning")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "租户 SCIM provisioning 状态", description = "Phase 11-2 Directory Sync")
  public AdminTenantScimProvisioningDto getScimProvisioning(@PathVariable UUID tenantId) {
    return scimProvisioningAdminService.getStatus(tenantId);
  }

  @PostMapping("/{tenantId}/scim-provisioning/generate-token")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "生成 SCIM Bearer token", description = "明文 token 仅本次响应返回")
  public AdminGenerateScimTokenResponse generateScimToken(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return scimProvisioningAdminService.generateToken(principal, tenantId);
  }

  @GetMapping("/{tenantId}/scim-sync-events/summary")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SCIM 同步事件摘要", description = "Phase 15-2 pending 冲突计数")
  public ScimSyncEventSummaryResponse getScimSyncEventSummary(@PathVariable UUID tenantId) {
    return scimSyncEventAdminService.summary(tenantId);
  }

  @GetMapping("/{tenantId}/scim-change-preview")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SCIM 变更预览", description = "Phase 16-2：合并入站事件与出站队列 diff")
  public ScimChangePreviewResponse getScimChangePreview(@PathVariable UUID tenantId) {
    return scimChangePreviewService.preview(tenantId);
  }

  @GetMapping("/{tenantId}/scim-schema-extension")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SCIM schema extension 摘要", description = "Phase 13-2 只读自定义属性")
  public AdminScimSchemaExtensionResponse getScimSchemaExtension(@PathVariable UUID tenantId) {
    return scimSchemaExtensionAdminService.getSummary(tenantId);
  }

  @GetMapping("/{tenantId}/scim-group-mapping-rules")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SCIM Group 映射规则", description = "Phase 14-2 只读列表")
  public AdminScimGroupMappingRuleListResponse getScimGroupMappingRules(@PathVariable UUID tenantId) {
    return scimGroupMappingRuleService.listRules(tenantId);
  }

  @PatchMapping("/{tenantId}/oidc-config")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "更新租户 OIDC 配置（骨架）", description = "不含 client_secret；后续对接 saas-web 登录入口")
  public AdminTenantOidcConfigDto patchOidcConfig(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody PatchTenantOidcConfigRequest request) {
    return tenantOidcAdminService.patchConfig(principal, tenantId, request);
  }

  @PostMapping("/{tenantId}/oidc-config/import-metadata")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "导入 IdP OIDC discovery metadata", description = "Phase 9-1：缓存 authorization/token/userinfo 端点并返回期望回调 URL")
  public TenantOidcMetadataImportResponse importOidcMetadata(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantOidcMetadataImportService.importMetadata(principal, tenantId);
  }

  @PostMapping("/{tenantId}/saml-config/import-metadata")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "导入 IdP SAML metadata", description = "Phase 12-1：从 metadata_url 拉取并解析 entityId/ssoUrl/证书")
  public TenantSamlMetadataImportResponse importSamlMetadata(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantSamlMetadataImportService.importMetadata(principal, tenantId);
  }

  @PostMapping("/{tenantId}/saml-config/rotate-sp-certificate")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "轮换 SP 签名证书", description = "Phase 12-1：生成自签 SP 证书用于 AuthnRequest 签名")
  public TenantSamlSpCertificateRotateResponse rotateSamlSpCertificate(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantSamlSpCertificateService.rotateCertificate(principal, tenantId);
  }

  @GetMapping("/{tenantId}/saml-idp-registrations")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "待审批 IdP 注册列表", description = "Phase 13-1 IdP 自助注册")
  public AdminTenantSamlIdpRegistrationListResponse listPendingSamlIdpRegistrations(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantSamlIdpRegistrationService.listPending(principal, tenantId);
  }

  @PostMapping("/{tenantId}/saml-idp-registrations/{registrationId}/approve")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "审批 IdP 注册", description = "Phase 13-1 将 pending 注册标记为 approved")
  public AdminTenantSamlIdpApproveResponse approveSamlIdpRegistration(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID registrationId) {
    return tenantSamlIdpRegistrationService.approve(principal, tenantId, registrationId);
  }

  @GetMapping("/{tenantId}/saml-idp-federation")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SAML IdP 联邦列表", description = "Phase 15-1 多 IdP 联邦")
  public TenantSamlIdpFederationListResponse listSamlIdpFederation(@PathVariable UUID tenantId) {
    return tenantSamlIdpFederationAdminService.list(tenantId);
  }

  @PostMapping("/{tenantId}/saml-idp-federation")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "添加 SAML IdP 联邦", description = "Phase 15-1")
  public TenantSamlIdpFederationDto addSamlIdpFederation(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody CreateTenantSamlIdpFederationRequest request) {
    return tenantSamlIdpFederationAdminService.add(principal, tenantId, request);
  }

  @DeleteMapping("/{tenantId}/saml-idp-federation/{federationId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "移除 SAML IdP 联邦", description = "Phase 15-1")
  public void removeSamlIdpFederation(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID federationId) {
    tenantSamlIdpFederationAdminService.remove(principal, tenantId, federationId);
  }

  @GetMapping("/{tenantId}/storage-estimate")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "租户存储用量估算（骨架）", description = "FND-08g 占位；后续对接对象存储计量")
  public AdminTenantStorageEstimateDto getStorageEstimate(@PathVariable UUID tenantId) {
    return tenantStorageEstimateAdminService.estimate(tenantId);
  }

  @GetMapping("/{tenantId}/menu-overrides")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "列出租户菜单覆盖", description = "Phase 5E-1 骨架；空列表表示全部继承平台模板")
  public AdminTenantMenuOverrideListResponse listMenuOverrides(@PathVariable UUID tenantId) {
    return tenantMenuOverrideAdminService.listOverrides(tenantId);
  }

  @GetMapping("/{tenantId}/menu-overrides/diff")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "租户菜单覆盖与平台模板 diff", description = "Phase 7-4 side-by-side 数据")
  public AdminTenantMenuDiffResponse menuOverrideDiff(@PathVariable UUID tenantId) {
    return tenantMenuOverrideAdminService.buildDiff(tenantId);
  }

  @PutMapping("/{tenantId}/menu-overrides")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "创建或更新租户菜单覆盖", description = "Phase 6-2；按 itemId upsert 单条 diff")
  public AdminTenantMenuOverrideDto upsertMenuOverride(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody PutTenantMenuOverrideRequest request) {
    return tenantMenuOverrideAdminService.upsertOverride(principal, tenantId, request);
  }

  @PostMapping("/{tenantId}/menu-overrides/batch")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "批量创建或更新租户菜单覆盖", description = "Phase 9-4；JSON 数组 upsert")
  public AdminTenantMenuOverrideListResponse batchUpsertMenuOverrides(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody PostTenantMenuOverrideBatchRequest request) {
    return tenantMenuOverrideAdminService.batchUpsert(principal, tenantId, request);
  }

  @DeleteMapping("/{tenantId}/menu-overrides/{itemId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "删除租户菜单覆盖", description = "恢复继承平台模板")
  public void deleteMenuOverride(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable String itemId) {
    tenantMenuOverrideAdminService.deleteOverride(principal, tenantId, itemId);
  }

  @GetMapping("/{tenantId}/saml-idp-health")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "SAML IdP 健康状态", description = "Phase 16-1：SSO 可达与 metadata 新鲜度")
  public TenantSamlIdpHealthResponse getSamlIdpHealth(@PathVariable UUID tenantId) {
    return tenantSamlIdpHealthService.assess(tenantId);
  }

  @PostMapping("/{tenantId}/saml-disconnect-drill")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "SAML 断连演练", description = "Phase 16-1：模拟 AuthnRequest 不完成登录")
  public TenantSamlDisconnectDrillResponse runSamlDisconnectDrill(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody(required = false) TenantSamlDisconnectDrillRequest request) {
    var idpEntityId = request == null ? null : request.idpEntityId();
    return tenantSamlDisconnectDrillService.runDrill(principal, tenantId, idpEntityId);
  }
}
