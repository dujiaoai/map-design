package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.admin.AdminBillingAdjustService;
import com.yunyan.billingapi.application.admin.AdminBillingPackageService;
import com.yunyan.billingapi.application.admin.AdminBillingRechargeOrderService;
import com.yunyan.billingapi.application.admin.AdminBillingRefundService;
import com.yunyan.billingapi.application.admin.AdminBillingStatsService;
import com.yunyan.billingapi.application.admin.AdminBillingUsageService;
import com.yunyan.billingapi.application.admin.AdminBillingWalletService;
import com.yunyan.billingapi.application.ratelimit.BillingRateLimitService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminAdjustRequest;
import com.yunyan.billingapi.web.dto.AdminAdjustRecordListResponse;
import com.yunyan.billingapi.web.dto.AdminAdjustResponse;
import com.yunyan.billingapi.web.dto.AdminBillingStatsResponse;
import com.yunyan.billingapi.web.dto.AdminRefundRequest;
import com.yunyan.billingapi.web.dto.AdminRefundResponse;
import com.yunyan.billingapi.web.dto.AdminRechargeOrderListResponse;
import com.yunyan.billingapi.web.dto.AdminRechargePackageListResponse;
import com.yunyan.billingapi.web.dto.AdminUsageSummaryResponse;
import com.yunyan.billingapi.web.dto.AdminWalletListResponse;
import com.yunyan.billingapi.web.dto.CreateAdminPackageRequest;
import com.yunyan.billingapi.web.dto.PatchAdminPackageRequest;
import com.yunyan.billingapi.web.dto.AdminRechargePackageDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
  private final AdminBillingRechargeOrderService adminBillingRechargeOrderService;
  private final AdminBillingPackageService adminBillingPackageService;
  private final AdminBillingStatsService adminBillingStatsService;
  private final AdminBillingUsageService adminBillingUsageService;
  private final AdminBillingRefundService adminBillingRefundService;
  private final BillingRateLimitService billingRateLimitService;

  public AdminBillingController(
      AdminBillingAdjustService adminBillingAdjustService,
      AdminBillingWalletService adminBillingWalletService,
      AdminBillingRechargeOrderService adminBillingRechargeOrderService,
      AdminBillingPackageService adminBillingPackageService,
      AdminBillingStatsService adminBillingStatsService,
      AdminBillingUsageService adminBillingUsageService,
      AdminBillingRefundService adminBillingRefundService,
      BillingRateLimitService billingRateLimitService) {
    this.adminBillingAdjustService = adminBillingAdjustService;
    this.adminBillingWalletService = adminBillingWalletService;
    this.adminBillingRechargeOrderService = adminBillingRechargeOrderService;
    this.adminBillingPackageService = adminBillingPackageService;
    this.adminBillingStatsService = adminBillingStatsService;
    this.adminBillingUsageService = adminBillingUsageService;
    this.adminBillingRefundService = adminBillingRefundService;
    this.billingRateLimitService = billingRateLimitService;
  }

  @GetMapping("/stats")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台计费汇总统计")
  public AdminBillingStatsResponse getStats() {
    return adminBillingStatsService.getStats();
  }

  @GetMapping("/usage")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台跨租户消费汇总")
  public AdminUsageSummaryResponse getUsage(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          Instant from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          Instant to,
      @RequestParam(required = false) String productCode) {
    return adminBillingUsageService.getUsage(tenantId, from, to, productCode);
  }

  @GetMapping("/packages")
  @PreAuthorize(
      "hasAnyAuthority('"
          + PermissionCodes.ADMIN_BILLING_READ
          + "','"
          + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE
          + "')")
  @Operation(summary = "平台查询全部充值 SKU（含 inactive）")
  public AdminRechargePackageListResponse listPackages() {
    return adminBillingPackageService.listPackages();
  }

  @PostMapping("/packages")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE + "')")
  @Operation(summary = "创建充值 SKU")
  public AdminRechargePackageDto createPackage(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateAdminPackageRequest request) {
    return adminBillingPackageService.createPackage(principal, request);
  }

  @PatchMapping("/packages/{code}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE + "')")
  @Operation(summary = "更新充值 SKU")
  public AdminRechargePackageDto patchPackage(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable String code,
      @Valid @RequestBody PatchAdminPackageRequest request) {
    return adminBillingPackageService.patchPackage(principal, code, request);
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

  @GetMapping("/recharge-orders")
  @PreAuthorize(
      "hasAnyAuthority('"
          + PermissionCodes.ADMIN_BILLING_READ
          + "','"
          + PermissionCodes.ADMIN_BILLING_REFUND
          + "')")
  @Operation(summary = "平台查询充值订单列表")
  public AdminRechargeOrderListResponse listRechargeOrders(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingRechargeOrderService.listOrders(tenantId, userId, status, page, size);
  }

  @PostMapping("/tenants/{tenantId}/adjust")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "平台人工调账（赠送/冲正/企业预付）")
  public AdminAdjustResponse adjustWallet(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID tenantId,
      @Valid @RequestBody AdminAdjustRequest request) {
    billingRateLimitService.checkAdminAdjust(principal.userId());
    return adminBillingAdjustService.adjust(principal, tenantId, request);
  }

  @GetMapping("/adjust-records")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "平台人工调账记录列表")
  public AdminAdjustRecordListResponse listAdjustRecords(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingAdjustService.listAdjustRecords(tenantId, userId, page, size);
  }

  @PostMapping("/recharge-orders/{orderNo}/refund")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_REFUND + "')")
  @Operation(summary = "平台对已支付充值订单发起退款（扣回积分 + 原路退款的网关骨架）")
  public AdminRefundResponse refundRechargeOrder(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable String orderNo,
      @Valid @RequestBody AdminRefundRequest request) {
    billingRateLimitService.checkAdminRefund(principal.userId());
    return adminBillingRefundService.refundOrder(principal, orderNo, request);
  }
}
