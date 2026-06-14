package com.yunyan.billingapi.web.controller;

import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billingapi.application.signup.SignupBonusService;
import com.yunyan.billingapi.web.dto.SignupBonusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/billing")
@Tag(name = "Billing Internal")
public class InternalBillingController {

  private final SignupBonusService signupBonusService;

  public InternalBillingController(SignupBonusService signupBonusService) {
    this.signupBonusService = signupBonusService;
  }

  @PostMapping("/signup-bonus")
  @Operation(summary = "发放注册体验积分（幂等）")
  public SignupBonusResponse signupBonus(@Valid @RequestBody SignupBonusRequest request) {
    return signupBonusService.grantSignupBonus(
        request.tenantId(), request.userId(), request.tenantKind());
  }
}
