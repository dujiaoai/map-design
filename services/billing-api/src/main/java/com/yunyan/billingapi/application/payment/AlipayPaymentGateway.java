package com.yunyan.billingapi.application.payment;

import org.springframework.stereotype.Component;

@Component
public class AlipayPaymentGateway implements PaymentGateway {

  @Override
  public String channel() {
    return PaymentWebhookChannels.ALIPAY;
  }

  @Override
  public PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode) {
    return new PaymentCreateResult("alipay-pending-" + orderNo, "https://openapi.alipay.com/gateway.do?out_trade_no=" + orderNo);
  }
}
