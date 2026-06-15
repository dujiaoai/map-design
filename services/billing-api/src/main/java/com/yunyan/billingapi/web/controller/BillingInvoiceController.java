package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.invoice.BillingInvoiceService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.CreateInvoiceRequest;
import com.yunyan.billingapi.web.dto.InvoiceListResponse;
import com.yunyan.billingapi.web.dto.InvoiceRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing/invoices")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class BillingInvoiceController {

  private final BillingInvoiceService billingInvoiceService;

  public BillingInvoiceController(BillingInvoiceService billingInvoiceService) {
    this.billingInvoiceService = billingInvoiceService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "为已支付充值订单申请发票")
  public InvoiceRequestDto createRequest(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateInvoiceRequest request) {
    return billingInvoiceService.createRequest(principal, request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "查询当前用户发票申请列表")
  public InvoiceListResponse listRequests(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return billingInvoiceService.listForUser(principal, page, size);
  }
}
