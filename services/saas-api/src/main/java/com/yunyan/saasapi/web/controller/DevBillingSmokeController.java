package com.yunyan.saasapi.web.controller;

import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.saasapi.application.billing.BillingInsufficientBalanceException;
import com.yunyan.saasapi.config.BillingApiProperties;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.dev.BillingSmokeConsumeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/dev/billing")
@Profile("dev")
@Tag(name = "Dev Billing")
@SecurityRequirement(name = "bearerAuth")
public class DevBillingSmokeController {

  private static final String SMOKE_RULE = "billing.smoke.consume";
  private static final String SMOKE_PRODUCT = "map-workspace";

  private final BillingClient billingClient;
  private final BillingApiProperties billingApiProperties;

  public DevBillingSmokeController(
      BillingClient billingClient, BillingApiProperties billingApiProperties) {
    this.billingClient = billingClient;
    this.billingApiProperties = billingApiProperties;
  }

  @PostMapping("/smoke-consume")
  @Operation(summary = "冒烟扣费：hold + confirm 各 1 点（dev profile）")
  public BillingSmokeConsumeResponse smokeConsume(@AuthenticationPrincipal SaasPrincipal principal) {
    if (!billingApiProperties.isEnabled()) {
      throw new IllegalStateException("Billing integration disabled (saas.billing.enabled=false)");
    }

    var estimate =
        billingClient.estimate(
            new WalletHoldRequest(
                principal.tenantId(),
                principal.userId(),
                SMOKE_PRODUCT,
                SMOKE_RULE,
                1,
                "estimate",
                null));

    var idempotencyKey =
        "smoke-api:" + principal.tenantId() + ":" + principal.userId() + ":" + UUID.randomUUID();

    var holdId =
        billingClient
            .hold(
                new WalletHoldRequest(
                    principal.tenantId(),
                    principal.userId(),
                    SMOKE_PRODUCT,
                    SMOKE_RULE,
                    1,
                    idempotencyKey,
                    "dev-smoke-consume"))
            .orElseThrow(
                () ->
                    new BillingInsufficientBalanceException(0L, estimate.points()));

    billingClient.confirm(holdId);
    return new BillingSmokeConsumeResponse(holdId, estimate.points(), "confirmed");
  }
}
