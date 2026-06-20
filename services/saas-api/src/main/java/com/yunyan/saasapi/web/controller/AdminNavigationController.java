package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminNavigationService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.web.dto.admin.AdminNavigationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/navigation")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
@SecurityRequirement(name = "bearerAuth")
public class AdminNavigationController {

  private final AdminNavigationService adminNavigationService;

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "Admin 侧栏导航", description = "按产品线返回导航分组；前端可 fallback 静态 registry")
  public AdminNavigationResponse navigation(@RequestParam(required = false) String product) {
    return adminNavigationService.getNavigation(product);
  }
}
