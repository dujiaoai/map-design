package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.TenantAdminService;
import com.yunyan.saasapi.application.admin.TenantFeatureAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.web.dto.admin.AdminTenantDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRequest;
import com.yunyan.saasapi.web.dto.admin.UpdateTenantFeaturesRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
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

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "列出全部租户")
  public AdminTenantListResponse listTenants() {
    return tenantAdminService.listTenants();
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
      @PathVariable UUID tenantId, @Valid @RequestBody UpdateTenantFeaturesRequest request) {
    return tenantFeatureAdminService.replaceFeatures(tenantId, request);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "创建租户")
  public AdminTenantDto createTenant(@Valid @RequestBody CreateTenantRequest request) {
    return tenantAdminService.createTenant(request);
  }

  @PatchMapping("/{tenantId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_WRITE + "')")
  @Operation(summary = "更新租户", description = "可修改 name、plan、status（active/suspended）")
  public AdminTenantDto patchTenant(
      @PathVariable UUID tenantId, @Valid @RequestBody PatchTenantRequest request) {
    return tenantAdminService.patchTenant(tenantId, request);
  }
}
