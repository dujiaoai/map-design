package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.admin.AdminBillingAdjustService;
import com.yunyan.billingapi.application.admin.AdminBillingWalletService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminAdjustRequest;
import com.yunyan.billingapi.web.dto.AdminAdjustResponse;
import com.yunyan.billingapi.web.dto.AdminWalletListResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin/billing")
@Tag(name = "Admin Billing")
@SecurityRequirement(name = "bearerAuth")
public class AdminBillingController {

  private final AdminBillingAdjustService adminBillingAdjustService;
  private final AdminBillingWalletService adminBillingWalletService;

  public AdminBillingController(
      AdminBillingAdjustService adminBillingAdjustService,
      AdminBillingWalletService adminBillingWalletService) {
    this.adminBillingAdjustService = adminBillingAdjustService;
    this.adminBillingWalletService = adminBillingWalletService;
  }

  @GetMapping("/wallets")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台查询用户钱包列表")
  public AdminWalletListResponse listWallets(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingWalletService.listWallets(tenantId, userId, page, size);
  }

  @PostMapping("/tenants/{tenantId}/adjust")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "平台人工调账（赠送/冲正/企业预付）")
  public AdminAdjustResponse adjustWallet(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody AdminAdjustRequest request) {
    return adminBillingAdjustService.adjust(principal, tenantId, request);
  }
}
