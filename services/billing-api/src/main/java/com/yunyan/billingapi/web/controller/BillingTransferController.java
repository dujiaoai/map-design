package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.transfer.BillingTransferService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.TransferRequest;
import com.yunyan.billingapi.web.dto.TransferResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class BillingTransferController {

  private final BillingTransferService billingTransferService;

  public BillingTransferController(BillingTransferService billingTransferService) {
    this.billingTransferService = billingTransferService;
  }

  @PostMapping("/transfer")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_TRANSFER_CREATE + "')")
  @Operation(summary = "租户管理员向成员划拨积分（从操作人钱包扣减）")
  public TransferResponse transfer(
      @AuthenticationPrincipal SaasPrincipal principal, @Valid @RequestBody TransferRequest request) {
    return billingTransferService.transfer(principal, request);
  }
}
