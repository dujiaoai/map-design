package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.PermissionCatalogAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreatePermissionModuleRequest;
import com.yunyan.saasapi.web.dto.admin.CreatePermissionRequest;
import com.yunyan.saasapi.web.dto.admin.PatchPermissionModuleRequest;
import com.yunyan.saasapi.web.dto.admin.PatchPermissionRequest;
import com.yunyan.saasapi.web.dto.admin.PermissionDto;
import com.yunyan.saasapi.web.dto.admin.PermissionModuleDto;
import com.yunyan.saasapi.web.dto.admin.PermissionModuleListResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminPermissionModulesController {

  private final PermissionCatalogAdminService permissionCatalogAdminService;

  @GetMapping("/permission-modules")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_READ + "')")
  @Operation(summary = "列出权限模块及下属权限项")
  public PermissionModuleListResponse listModules() {
    return permissionCatalogAdminService.listModulesWithPermissions();
  }

  @PostMapping("/permission-modules")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @Operation(summary = "创建自定义权限模块")
  public PermissionModuleDto createModule(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreatePermissionModuleRequest request) {
    return permissionCatalogAdminService.createModule(principal, request);
  }

  @PatchMapping("/permission-modules/{moduleId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @Operation(summary = "更新权限模块元数据")
  public PermissionModuleDto patchModule(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID moduleId,
      @Valid @RequestBody PatchPermissionModuleRequest request) {
    return permissionCatalogAdminService.patchModule(principal, moduleId, request);
  }

  @DeleteMapping("/permission-modules/{moduleId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "删除自定义权限模块", description = "模块下须无权限项")
  public void deleteModule(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID moduleId) {
    permissionCatalogAdminService.deleteModule(principal, moduleId);
  }

  @PostMapping("/permission-modules/{moduleId}/permissions")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @Operation(summary = "在模块下创建权限项")
  public PermissionDto createPermission(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID moduleId,
      @Valid @RequestBody CreatePermissionRequest request) {
    return permissionCatalogAdminService.createPermission(principal, moduleId, request);
  }

  @PatchMapping("/permissions/{permissionId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @Operation(summary = "更新权限项元数据")
  public PermissionDto patchPermission(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID permissionId,
      @Valid @RequestBody PatchPermissionRequest request) {
    return permissionCatalogAdminService.patchPermission(principal, permissionId, request);
  }

  @DeleteMapping("/permissions/{permissionId}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_ROLES_WRITE + "')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "删除自定义权限项", description = "未被角色绑定时可删")
  public void deletePermission(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID permissionId) {
    permissionCatalogAdminService.deletePermission(principal, permissionId);
  }
}
