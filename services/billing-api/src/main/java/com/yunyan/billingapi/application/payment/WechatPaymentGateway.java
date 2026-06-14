package com.yunyan.billingapi.application.payment;

import org.springframework.stereotype.Component;

@Component
public class WechatPaymentGateway implements PaymentGateway {

  @Override
  public String channel() {
    return PaymentWebhookChannels.WECHAT;
  }

  @Override
  public PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode) {
    return new PaymentCreateResult("wx-pending-" + orderNo, "weixin://wxpay/bizpayurl?pr=" + orderNo);
  }
}
