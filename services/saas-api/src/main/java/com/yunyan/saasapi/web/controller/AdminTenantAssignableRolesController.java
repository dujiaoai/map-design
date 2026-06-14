package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.TenantRoleAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AssignableRoleListResponse;
import com.yunyan.saasapi.web.dto.admin.PermissionListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/tenants/{tenantId}")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "租户角色查询（Sprint D+）")
@SecurityRequirement(name = "bearerAuth")
public class AdminTenantAssignableRolesController {

  private final TenantRoleAdminService tenantRoleAdminService;

  @GetMapping("/assignable-roles")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "列出可分配给成员的角色")
  public AssignableRoleListResponse listAssignableRoles(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantRoleAdminService.listAssignableRoles(principal, tenantId);
  }

  @GetMapping("/assignable-permissions")
  @PreAuthorize(
      "hasAuthority('"
          + PermissionCodes.ADMIN_MEMBERS_READ
          + "') or hasAuthority('ROLE_PLATFORM_ADMIN')")
  @Operation(summary = "列出可绑定到租户自定义角色的权限", description = "仅 tenant / workspace scope")
  public PermissionListResponse listAssignablePermissions(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID tenantId) {
    return tenantRoleAdminService.listAssignablePermissions(principal, tenantId);
  }
}
