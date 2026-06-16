package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminMfaService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminMfaStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/mfa")
@RequiredArgsConstructor
@Tag(name = "Admin MFA", description = "平台管理员 MFA（ADR-0008；骨架只读）")
public class AdminMfaController {

  private final AdminMfaService adminMfaService;

  @GetMapping("/status")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "当前用户 MFA 状态",
      description =
          """
          返回平台强制开关与当前用户 TOTP 注册摘要。
          骨架期 totpEnrollmentAvailable 与 enrolled 均为 false；Phase 2 开放注册与登录 step-up。
          """)
  public AdminMfaStatusResponse status(@AuthenticationPrincipal SaasPrincipal principal) {
    return adminMfaService.getStatus(principal);
  }
}
