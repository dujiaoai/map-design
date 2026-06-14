package com.yunyan.billingapi.web.controller;

import com.yunyan.billingapi.application.payment.PaymentWebhookService;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/billing/webhooks")
@Tag(name = "Billing Webhooks")
public class PaymentWebhookController {

  private final PaymentWebhookService paymentWebhookService;

  public PaymentWebhookController(PaymentWebhookService paymentWebhookService) {
    this.paymentWebhookService = paymentWebhookService;
  }

  @PostMapping("/wechat")
  @Operation(summary = "微信支付回调（骨架：JSON + X-Billing-Webhook-Token）")
  public Map<String, String> wechat(
      @RequestHeader(value = PaymentWebhookService.WEBHOOK_TOKEN_HEADER, required = false)
          String token,
      @Valid @RequestBody PaymentWebhookPayload payload) {
    paymentWebhookService.verifyToken(token);
    paymentWebhookService.handleWechat(payload);
    return Map.of("code", "SUCCESS");
  }

  @PostMapping("/alipay")
  @Operation(summary = "支付宝回调（骨架：JSON + X-Billing-Webhook-Token）")
  public Map<String, String> alipay(
      @RequestHeader(value = PaymentWebhookService.WEBHOOK_TOKEN_HEADER, required = false)
          String token,
      @Valid @RequestBody PaymentWebhookPayload payload) {
    paymentWebhookService.verifyToken(token);
    paymentWebhookService.handleAlipay(payload);
    return Map.of("code", "SUCCESS");
  }
}
