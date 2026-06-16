package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.navigation.WorkspaceMenuService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.navigation.MenusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/menus")
@RequiredArgsConstructor
@Tag(name = "Menus")
@SecurityRequirement(name = "bearerAuth")
public class MenusController {

  private final WorkspaceMenuService workspaceMenuService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.WORKSPACE_USE + "')")
  @Operation(
      summary = "获取当前租户工作台菜单",
      description =
          "返回侧栏分段与全量可见菜单项（含 map-tool）；已按 tenant features 过滤定制模块。")
  @ApiResponse(responseCode = "200", description = "菜单树")
  @ApiResponse(
      responseCode = "401",
      description = "未认证",
      content = @Content(mediaType = "application/problem+json"))
  @ApiResponse(
      responseCode = "403",
      description = "无 workspace:use 权限",
      content = @Content(mediaType = "application/problem+json"))
  public MenusResponse list(@AuthenticationPrincipal SaasPrincipal principal) {
    return workspaceMenuService.getMenusForCurrentTenant(principal);
  }
}
