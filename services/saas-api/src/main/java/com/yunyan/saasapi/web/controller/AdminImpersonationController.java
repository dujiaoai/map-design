package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.ImpersonationAdminService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.StartImpersonationRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/impersonation")
@RequiredArgsConstructor
@Tag(name = "Admin Impersonation", description = "平台租户代操作（ADR-0007）")
public class AdminImpersonationController {

  private final ImpersonationAdminService impersonationAdminService;

  @PostMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_IMPERSONATE + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "开始代操作",
      description = "签发含 act_as_tenant 的新 token 对；须 PLATFORM_ADMIN 且具备 admin:impersonate。")
  public LoginResponse start(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody StartImpersonationRequest request) {
    return impersonationAdminService.start(principal, request);
  }

  @DeleteMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_IMPERSONATE + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "结束代操作", description = "清除 act_as_tenant 并重签 token。")
  public LoginResponse stop(@AuthenticationPrincipal SaasPrincipal principal) {
    return impersonationAdminService.stop(principal);
  }
}
