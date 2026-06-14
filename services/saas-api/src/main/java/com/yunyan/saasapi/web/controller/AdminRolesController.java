package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.RoleAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.PermissionListResponse;
import com.yunyan.saasapi.web.dto.admin.RoleListResponse;
import com.yunyan.saasapi.web.dto.admin.RolePermissionsResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateRolePermissionsRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminRolesController {

  private final RoleAdminService roleAdminService;

  @GetMapping("/roles")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_READ + "')")
  @Operation(summary = "列出全部角色")
  public RoleListResponse listRoles() {
    return roleAdminService.listRoles();
  }

  @GetMapping("/permissions")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_READ + "')")
  @Operation(summary = "列出权限目录")
  public PermissionListResponse listPermissions() {
    return roleAdminService.listPermissions();
  }

  @GetMapping("/roles/{roleId}/permissions")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_READ + "')")
  @Operation(summary = "获取角色已绑定权限")
  public RolePermissionsResponse getRolePermissions(@PathVariable UUID roleId) {
    return roleAdminService.getRolePermissions(roleId);
  }

  @PutMapping("/roles/{roleId}/permissions")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @Operation(summary = "更新角色权限绑定", description = "全量替换；需与角色 scope 规则一致")
  public RolePermissionsResponse updateRolePermissions(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID roleId,
      @Valid @RequestBody UpdateRolePermissionsRequest request) {
    return roleAdminService.updateRolePermissions(principal, roleId, request);
  }
}
