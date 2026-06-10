package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.domain.permission.PermissionCodes;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
@Tag(name = "Admin", description = "平台后台管理（Sprint D）")
public class AdminController {

  @GetMapping("/ping")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @Operation(summary = "Admin API 健康检查", description = "需 `admin:tenants:read` 权限")
  public Map<String, String> ping() {
    return Map.of("status", "ok");
  }
}
