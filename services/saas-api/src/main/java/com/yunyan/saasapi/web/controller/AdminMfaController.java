package com.yunyan.saasapi.web.controller;

import com.yunyan.saasapi.application.admin.AdminMfaService;
import com.yunyan.saasapi.domain.permission.PermissionCodes;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminMfaStatusResponse;
import com.yunyan.saasapi.web.dto.admin.RegenerateRecoveryCodesRequest;
import com.yunyan.saasapi.web.dto.admin.TotpDisableRequest;
import com.yunyan.saasapi.web.dto.admin.TotpEnrollResponse;
import com.yunyan.saasapi.web.dto.admin.TotpVerifyRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/mfa")
@RequiredArgsConstructor
@Tag(name = "Admin MFA", description = "平台管理员 TOTP MFA（ADR-0008）")
public class AdminMfaController {

  private final AdminMfaService adminMfaService;

  @GetMapping("/status")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "当前用户 MFA 状态")
  public AdminMfaStatusResponse status(@AuthenticationPrincipal SaasPrincipal principal) {
    return adminMfaService.getStatus(principal);
  }

  @PostMapping("/totp/enroll")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "开始 TOTP 注册", description = "返回 secret、otpauth URI 与 QR 数据 URL；10 分钟内须 verify。")
  public TotpEnrollResponse enrollTotp(@AuthenticationPrincipal SaasPrincipal principal) {
    return adminMfaService.startTotpEnroll(principal);
  }

  @PostMapping("/totp/verify")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "确认 TOTP 注册", description = "校验 6 位码并完成绑定。")
  public AdminMfaStatusResponse verifyTotp(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody TotpVerifyRequest request) {
    return adminMfaService.verifyTotpEnroll(principal, request);
  }

  @DeleteMapping("/totp")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(summary = "注销 TOTP", description = "须提交当前有效 6 位码或一次性恢复码。")
  public AdminMfaStatusResponse disableTotp(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody TotpDisableRequest request) {
    return adminMfaService.disableTotp(principal, request);
  }

  @PostMapping("/recovery-codes/regenerate")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_TENANTS_READ + "')")
  @SecurityRequirement(name = "bearerAuth")
  @Operation(
      summary = "重新生成恢复码",
      description = "须 TOTP 6 位码；旧未使用恢复码全部作废，新码仅本次响应明文展示。")
  public AdminMfaStatusResponse regenerateRecoveryCodes(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody RegenerateRecoveryCodesRequest request) {
    return adminMfaService.regenerateRecoveryCodes(principal, request);
  }
}
