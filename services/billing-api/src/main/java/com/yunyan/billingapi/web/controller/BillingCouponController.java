package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.coupon.BillingCouponService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.RedeemCouponRequest;
import com.yunyan.billingapi.web.dto.RedeemCouponResponse;
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
@RequestMapping("/v1/billing/coupons")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class BillingCouponController {

  private final BillingCouponService billingCouponService;

  public BillingCouponController(BillingCouponService billingCouponService) {
    this.billingCouponService = billingCouponService;
  }

  @PostMapping("/redeem")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_WALLET_READ + "')")
  @Operation(summary = "兑换优惠券（赠送积分）")
  public RedeemCouponResponse redeem(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody RedeemCouponRequest request) {
    return billingCouponService.redeem(principal, request);
  }
}
