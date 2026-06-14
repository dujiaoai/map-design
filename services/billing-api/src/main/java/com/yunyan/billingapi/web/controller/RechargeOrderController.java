package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.recharge.RechargeOrderService;
import com.yunyan.billingapi.domain.permission.PermissionCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.CreateRechargeOrderRequest;
import com.yunyan.billingapi.web.dto.RechargeOrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing/recharge-orders")
@Tag(name = "Billing")
@SecurityRequirement(name = "bearerAuth")
public class RechargeOrderController {

  private final RechargeOrderService rechargeOrderService;

  public RechargeOrderController(RechargeOrderService rechargeOrderService) {
    this.rechargeOrderService = rechargeOrderService;
  }

  @PostMapping
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "创建充值订单")
  public RechargeOrderResponse createOrder(
      @AuthenticationPrincipal SaasPrincipal principal,
      @Valid @RequestBody CreateRechargeOrderRequest request) {
    return rechargeOrderService.createOrder(principal, request);
  }

  @GetMapping("/{orderNo}")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "查询充值订单")
  public RechargeOrderResponse getOrder(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable String orderNo) {
    return rechargeOrderService.getOrder(principal, orderNo);
  }

  @PostMapping("/{orderNo}/cancel")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "取消待支付充值订单")
  public RechargeOrderResponse cancelOrder(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable String orderNo) {
    return rechargeOrderService.cancelOrder(principal, orderNo);
  }

  @PostMapping("/{orderNo}/mock-pay")
  @PreAuthorize("hasAuthority('" + PermissionCodes.BILLING_RECHARGE_CREATE + "')")
  @Operation(summary = "沙箱模拟支付成功（mock-enabled 时可用）")
  public RechargeOrderResponse mockPay(
      @AuthenticationPrincipal SaasPrincipal principal, @PathVariable String orderNo) {
    return rechargeOrderService.completeMockPayment(principal, orderNo);
  }
}
