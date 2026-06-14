package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.recharge.RechargeOrderService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.web.dto.PaymentWebhookPayload;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PaymentWebhookService {

  public static final String WEBHOOK_TOKEN_HEADER = "X-Billing-Webhook-Token";

  private final BillingAppProperties billingAppProperties;
  private final RechargeOrderService rechargeOrderService;

  public PaymentWebhookService(
      BillingAppProperties billingAppProperties, RechargeOrderService rechargeOrderService) {
    this.billingAppProperties = billingAppProperties;
    this.rechargeOrderService = rechargeOrderService;
  }

  public void verifyToken(String token) {
    var expected = billingAppProperties.getWebhook().getToken();
    if (!StringUtils.hasText(expected) || !expected.equals(token)) {
      throw AuthException.unauthorized("Invalid webhook token");
    }
  }

  public void handleWechat(PaymentWebhookPayload payload) {
    rechargeOrderService.completeWebhookPayment(PaymentWebhookChannels.WECHAT, payload);
  }

  public void handleAlipay(PaymentWebhookPayload payload) {
    rechargeOrderService.completeWebhookPayment(PaymentWebhookChannels.ALIPAY, payload);
  }
}
