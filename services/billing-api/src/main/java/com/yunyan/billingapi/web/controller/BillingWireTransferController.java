package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.wiretransfer.BillingWireTransferService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.CreateWireTransferRequest;
import com.yunyan.billingapi.web.dto.WireTransferListResponse;
import com.yunyan.billingapi.web.dto.WireTransferRequestDto;
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
@RequestMapping("/v1/billing/wire-transfers")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class BillingWireTransferController {

  private final BillingWireTransferService billingWireTransferService;

  public BillingWireTransferController(BillingWireTransferService billingWireTransferService) {
    this.billingWireTransferService = billingWireTransferService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "提交对公转账预付申请")
  public WireTransferRequestDto createRequest(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateWireTransferRequest request) {
    return billingWireTransferService.createRequest(principal, request);
  }

  @GetMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "查询当前用户对公转账申请")
  public WireTransferListResponse listRequests(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return billingWireTransferService.listForUser(principal, page, size);
  }
}
