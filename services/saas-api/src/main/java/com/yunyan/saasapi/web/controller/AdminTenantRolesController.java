package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.TenantRoleAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRoleRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRoleRequest;
import com.yunyan.saasapi.web.dto.admin.RolePermissionsResponse;
import com.yunyan.saasapi.web.dto.admin.TenantRoleListResponse;
import com.yunyan.saasapi.web.dto.admin.TenantRoleSummaryDto;
import com.yunyan.saasapi.web.dto.admin.UpdateRolePermissionsRequest;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/tenants/{tenantId}/roles")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "租户自定义角色（Sprint D+）")
@SecurityRequirement(name = "bearerAuth")
public class AdminTenantRolesController {

  private final TenantRoleAdminService tenantRoleAdminService;

  @GetMapping
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "列出租户自定义角色")
  public TenantRoleListResponse listRoles(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantRoleAdminService.listCustomRoles(principal, tenantId);
  }

  @PostMapping
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "创建租户自定义角色")
  public TenantRoleSummaryDto createRole(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody CreateTenantRoleRequest request) {
    return tenantRoleAdminService.createRole(principal, tenantId, request);
  }

  @PatchMapping("/{roleId}")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "更新租户自定义角色元数据")
  public TenantRoleSummaryDto patchRole(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID roleId,
      @Valid @RequestBody PatchTenantRoleRequest request) {
    return tenantRoleAdminService.patchRole(principal, tenantId, roleId, request);
  }

  @DeleteMapping("/{roleId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "删除租户自定义角色")
  public void deleteRole(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID roleId) {
    tenantRoleAdminService.deleteRole(principal, tenantId, roleId);
  }

  @GetMapping("/{roleId}/permissions")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "获取租户自定义角色权限")
  public RolePermissionsResponse getRolePermissions(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID roleId) {
    return tenantRoleAdminService.getRolePermissions(principal, tenantId, roleId);
  }

  @PutMapping("/{roleId}/permissions")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_WRITE
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "更新租户自定义角色权限")
  public RolePermissionsResponse updateRolePermissions(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @PathVariable UUID roleId,
      @Valid @RequestBody UpdateRolePermissionsRequest request) {
    return tenantRoleAdminService.updateRolePermissions(principal, tenantId, roleId, request);
  }
}
