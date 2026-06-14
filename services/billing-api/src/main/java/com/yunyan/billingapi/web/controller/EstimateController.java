package com.yunyan.billingapi.web.controller;

import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.application.hold.HoldService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class EstimateController {

  private final HoldService holdService;

  public EstimateController(HoldService holdService) {
    this.holdService = holdService;
  }

  @GetMapping("/estimate")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_WALLET_READ + "')")
  @Operation(summary = "预估本次操作消耗积分")
  public EstimateResult estimate(
      @AuthenticationPrincipal SaasPrincipal principal,
      @RequestParam String productCode,
      @RequestParam String ruleCode,
      @RequestParam(defaultValue = "1") int quantity) {
    return holdService.estimate(
        new WalletHoldRequest(
            principal.tenantId(),
            principal.userId(),
            productCode,
            ruleCode,
            quantity,
            "client-estimate",
            null));
  }
}
