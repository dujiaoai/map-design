package com.yunyan.billingapi.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.application.payment.PaymentWebhookService;
import com.yunyan.billingapi.application.payment.PaymentWebhookSignatureService;
import com.yunyan.billingapi.application.ratelimit.BillingRateLimitService;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;
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
  private final PaymentWebhookSignatureService paymentWebhookSignatureService;
  private final BillingRateLimitService billingRateLimitService;
  private final ObjectMapper objectMapper;
  private final Validator validator;

  public PaymentWebhookController(
      PaymentWebhookService paymentWebhookService,
      PaymentWebhookSignatureService paymentWebhookSignatureService,
      BillingRateLimitService billingRateLimitService,
      ObjectMapper objectMapper,
      Validator validator) {
    this.paymentWebhookService = paymentWebhookService;
    this.paymentWebhookSignatureService = paymentWebhookSignatureService;
    this.billingRateLimitService = billingRateLimitService;
    this.objectMapper = objectMapper;
    this.validator = validator;
  }

  @PostMapping("/wechat")
  @Operation(summary = "微信支付回调（Token + 可选 HMAC / WeChat V3 RSA 验签）")
  public Map<String, String> wechat(
      @RequestHeader(value = PaymentWebhookService.WEBHOOK_TOKEN_HEADER, required = false)
          String token,
      @RequestBody String rawBody,
      HttpServletRequest request)
      throws Exception {
    return handleWebhook(PaymentWebhookChannels.WECHAT, token, rawBody, request);
  }

  @PostMapping("/alipay")
  @Operation(summary = "支付宝回调（Token + 可选 HMAC / Alipay RSA 验签）")
  public Map<String, String> alipay(
      @RequestHeader(value = PaymentWebhookService.WEBHOOK_TOKEN_HEADER, required = false)
          String token,
      @RequestBody String rawBody,
      HttpServletRequest request)
      throws Exception {
    return handleWebhook(PaymentWebhookChannels.ALIPAY, token, rawBody, request);
  }

  private Map<String, String> handleWebhook(
      String channel,
      String token,
      String rawBody,
      HttpServletRequest request)
      throws Exception {
    paymentWebhookService.verifyToken(token);
    paymentWebhookSignatureService.verifyIfEnabled(channel, rawBody, request);
    billingRateLimitService.checkWebhook(request);
    var payload = objectMapper.readValue(rawBody, PaymentWebhookPayload.class);
    validatePayload(payload);
    if (PaymentWebhookChannels.WECHAT.equals(channel)) {
      paymentWebhookService.handleWechat(payload);
    } else {
      paymentWebhookService.handleAlipay(payload);
    }
    return Map.of("code", "SUCCESS");
  }

  private void validatePayload(PaymentWebhookPayload payload) {
    var violations = validator.validate(payload);
    if (!violations.isEmpty()) {
      throw new ConstraintViolationException(violations);
    }
  }
}
