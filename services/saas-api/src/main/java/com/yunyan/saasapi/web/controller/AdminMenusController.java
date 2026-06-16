package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.navigation.WorkspaceMenuAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminMenusResponse;
import com.yunyan.saasapi.web.dto.admin.UpdateWorkspaceMenusRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/menus")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminMenusController {

  private final WorkspaceMenuAdminService workspaceMenuAdminService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_MENUS_READ + "')")
  @Operation(summary = "获取工作台菜单模板", description = "含已禁用项，供 Admin 编辑")
  public AdminMenusResponse getMenus() {
    return workspaceMenuAdminService.getMenus();
  }

  @PutMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_MENUS_WRITE + "')")
  @Operation(summary = "批量更新工作台菜单模板", description = "仅允许修改显隐、排序与标题")
  public AdminMenusResponse updateMenus(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody UpdateWorkspaceMenusRequest request) {
    return workspaceMenuAdminService.replaceMenus(principal, request);
  }
}
