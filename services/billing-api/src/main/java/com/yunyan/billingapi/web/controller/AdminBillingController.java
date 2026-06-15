package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.admin.AdminBillingAdjustService;
import com.yunyan.billingapi.application.admin.AdminBillingCouponService;
import com.yunyan.billingapi.application.admin.AdminBillingLedgerService;
import com.yunyan.billingapi.application.admin.AdminBillingWireTransferService;
import com.yunyan.billingapi.application.admin.AdminBillingPackageService;
import com.yunyan.billingapi.application.admin.AdminBillingRechargeOrderService;
import com.yunyan.billingapi.application.admin.AdminBillingReconciliationService;
import com.yunyan.billingapi.application.admin.AdminBillingRefundService;
import com.yunyan.billingapi.application.admin.AdminBillingStatsService;
import com.yunyan.billingapi.application.admin.AdminBillingUsageService;
import com.yunyan.billingapi.application.admin.AdminBillingWalletService;
import com.yunyan.billingapi.application.invoice.BillingInvoiceService;
import com.yunyan.billingapi.application.wiretransfer.BillingWireTransferService;
import com.yunyan.billingapi.application.ratelimit.BillingRateLimitService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminAdjustRecordListResponse;
import com.yunyan.billingapi.web.dto.AdminAdjustRequest;
import com.yunyan.billingapi.web.dto.AdminLedgerListResponse;
import com.yunyan.billingapi.web.dto.AdminAdjustResponse;
import com.yunyan.billingapi.web.dto.AdminBillingStatsResponse;
import com.yunyan.billingapi.web.dto.AdminIssueInvoiceRequest;
import com.yunyan.billingapi.web.dto.AdminRejectInvoiceRequest;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import com.yunyan.billingapi.web.dto.AdminRefundRequest;
import com.yunyan.billingapi.web.dto.AdminRefundResponse;
import com.yunyan.billingapi.web.dto.InvoiceListResponse;
import com.yunyan.billingapi.web.dto.InvoiceRequestDto;
import com.yunyan.billingapi.web.dto.WireTransferListResponse;
import com.yunyan.billingapi.web.dto.WireTransferRequestDto;
import com.yunyan.billingapi.web.dto.AdminCouponDto;
import com.yunyan.billingapi.web.dto.AdminCouponListResponse;
import com.yunyan.billingapi.web.dto.CreateAdminCouponRequest;
import com.yunyan.billingapi.web.dto.PatchAdminCouponRequest;
import com.yunyan.billingapi.web.dto.ApproveWireTransferResponse;
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
import java.time.LocalDate;
import java.time.ZoneOffset;
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
  private final AdminBillingLedgerService adminBillingLedgerService;
  private final AdminBillingWalletService adminBillingWalletService;
  private final AdminBillingRechargeOrderService adminBillingRechargeOrderService;
  private final AdminBillingPackageService adminBillingPackageService;
  private final AdminBillingCouponService adminBillingCouponService;
  private final AdminBillingStatsService adminBillingStatsService;
  private final AdminBillingUsageService adminBillingUsageService;
  private final AdminBillingRefundService adminBillingRefundService;
  private final AdminBillingReconciliationService adminBillingReconciliationService;
  private final BillingInvoiceService billingInvoiceService;
  private final AdminBillingWireTransferService adminBillingWireTransferService;
  private final BillingWireTransferService billingWireTransferService;
  private final BillingRateLimitService billingRateLimitService;

  public AdminBillingController(
      AdminBillingAdjustService adminBillingAdjustService,
      AdminBillingLedgerService adminBillingLedgerService,
      AdminBillingWalletService adminBillingWalletService,
      AdminBillingRechargeOrderService adminBillingRechargeOrderService,
      AdminBillingPackageService adminBillingPackageService,
      AdminBillingCouponService adminBillingCouponService,
      AdminBillingStatsService adminBillingStatsService,
      AdminBillingUsageService adminBillingUsageService,
      AdminBillingRefundService adminBillingRefundService,
      AdminBillingReconciliationService adminBillingReconciliationService,
      BillingInvoiceService billingInvoiceService,
      AdminBillingWireTransferService adminBillingWireTransferService,
      BillingWireTransferService billingWireTransferService,
      BillingRateLimitService billingRateLimitService) {
    this.adminBillingAdjustService = adminBillingAdjustService;
    this.adminBillingLedgerService = adminBillingLedgerService;
    this.adminBillingWalletService = adminBillingWalletService;
    this.adminBillingRechargeOrderService = adminBillingRechargeOrderService;
    this.adminBillingPackageService = adminBillingPackageService;
    this.adminBillingCouponService = adminBillingCouponService;
    this.adminBillingStatsService = adminBillingStatsService;
    this.adminBillingUsageService = adminBillingUsageService;
    this.adminBillingRefundService = adminBillingRefundService;
    this.adminBillingReconciliationService = adminBillingReconciliationService;
    this.billingInvoiceService = billingInvoiceService;
    this.adminBillingWireTransferService = adminBillingWireTransferService;
    this.billingWireTransferService = billingWireTransferService;
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
  public AdminRechargePackageListResponse listPackages(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String code,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingPackageService.listPackages(status, code, page, size);
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

  @GetMapping("/coupons")
  @PreAuthorize(
      "hasAnyAuthority('"
          + PermissionCodes.ADMIN_BILLING_READ
          + "','"
          + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE
          + "')")
  @Operation(summary = "平台查询优惠券列表")
  public AdminCouponListResponse listCoupons(
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String code,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingCouponService.listCoupons(status, code, page, size);
  }

  @PostMapping("/coupons")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE + "')")
  @Operation(summary = "创建优惠券")
  public AdminCouponDto createCoupon(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateAdminCouponRequest request) {
    return adminBillingCouponService.createCoupon(principal, request);
  }

  @PatchMapping("/coupons/{code}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_PACKAGES_WRITE + "')")
  @Operation(summary = "更新优惠券")
  public AdminCouponDto patchCoupon(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable String code,
      @Valid @RequestBody PatchAdminCouponRequest request) {
    return adminBillingCouponService.patchCoupon(principal, code, request);
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

  @GetMapping("/tenants/{tenantId}/ledger")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台查询租户积分流水")
  public AdminLedgerListResponse listLedger(
      @PathVariable UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(required = false) String entryType,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return adminBillingLedgerService.listLedger(tenantId, userId, entryType, page, size);
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

  @GetMapping("/reconciliation/daily")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "日对账：充值订单 vs 积分流水（UTC 自然日）")
  public AdminReconciliationDailyResponse getDailyReconciliation(
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate date) {
    var reportDate = date != null ? date : LocalDate.now(ZoneOffset.UTC).minusDays(1);
    return adminBillingReconciliationService.getDailyReport(reportDate);
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

  @GetMapping("/invoices")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台查询发票申请列表")
  public InvoiceListResponse listInvoices(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return billingInvoiceService.listForAdmin(tenantId, userId, status, page, size);
  }

  @PostMapping("/invoices/{invoiceId}/issue")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "标记发票申请为已开具（骨架，可选 pdfUrl）")
  public InvoiceRequestDto issueInvoice(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID invoiceId,
      @RequestBody(required = false) @Valid AdminIssueInvoiceRequest request) {
    return billingInvoiceService.issue(principal, invoiceId, request);
  }

  @PostMapping("/invoices/{invoiceId}/reject")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "驳回发票申请")
  public InvoiceRequestDto rejectInvoice(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID invoiceId,
      @Valid @RequestBody AdminRejectInvoiceRequest request) {
    return billingInvoiceService.reject(principal, invoiceId, request);
  }

  @GetMapping("/wire-transfers")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_READ + "')")
  @Operation(summary = "平台查询对公转账申请列表")
  public WireTransferListResponse listWireTransfers(
      @RequestParam(required = false) UUID tenantId,
      @RequestParam(required = false) UUID userId,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return billingWireTransferService.listForAdmin(tenantId, userId, status, page, size);
  }

  @PostMapping("/wire-transfers/{requestId}/approve")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "审核通过对公转账申请并入账积分")
  public ApproveWireTransferResponse approveWireTransfer(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable UUID requestId) {
    billingRateLimitService.checkAdminAdjust(principal.userId());
    return adminBillingWireTransferService.approve(principal, requestId);
  }

  @PostMapping("/wire-transfers/{requestId}/reject")
  @PreAuthorize("hasAuthority('" + PermissionCodes.ADMIN_BILLING_ADJUST + "')")
  @Operation(summary = "驳回对公转账申请")
  public WireTransferRequestDto rejectWireTransfer(
      @AuthenticationPrincipal SaasPrincipal principal,
      @PathVariable UUID requestId,
      @Valid @RequestBody AdminRejectInvoiceRequest request) {
    return adminBillingWireTransferService.reject(principal, requestId, request);
  }
}
