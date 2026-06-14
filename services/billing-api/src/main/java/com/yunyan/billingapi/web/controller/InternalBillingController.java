package com.yunyan.billingapi.web.controller;

import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.application.hold.HoldService;
import com.yunyan.billingapi.application.signup.SignupBonusService;
import com.yunyan.billingapi.web.dto.HoldResponse;
import com.yunyan.billingapi.web.dto.SignupBonusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/billing")
@Tag(name = "Billing Internal")
public class InternalBillingController {

  private final SignupBonusService signupBonusService;
  private final HoldService holdService;

  public InternalBillingController(SignupBonusService signupBonusService, HoldService holdService) {
    this.signupBonusService = signupBonusService;
    this.holdService = holdService;
  }

  @PostMapping("/signup-bonus")
  @Operation(summary = "发放注册体验积分（幂等）")
  public SignupBonusResponse signupBonus(@Valid @RequestBody SignupBonusRequest request) {
    return signupBonusService.grantSignupBonus(
        request.tenantId(), request.userId(), request.tenantKind());
  }

  @PostMapping("/hold")
  @Operation(summary = "冻结积分（两阶段扣费第一阶段）")
  public HoldResponse hold(@Valid @RequestBody WalletHoldRequest request) {
    return holdService.hold(request);
  }

  @PostMapping("/hold/{holdId}/confirm")
  @Operation(summary = "确认扣费")
  public void confirmHold(@PathVariable UUID holdId) {
    holdService.confirm(holdId);
  }

  @PostMapping("/hold/{holdId}/cancel")
  @Operation(summary = "取消冻结")
  public void cancelHold(@PathVariable UUID holdId) {
    holdService.cancel(holdId);
  }

  @GetMapping("/estimate")
  @Operation(summary = "预估扣费积分")
  public EstimateResult estimate(
      @RequestParam UUID tenantId,
      @RequestParam UUID userId,
      @RequestParam String productCode,
      @RequestParam String ruleCode,
      @RequestParam long quantity) {
    return holdService.estimate(
        new WalletHoldRequest(
            tenantId, userId, productCode, ruleCode, quantity, "estimate-only", null));
  }
}
