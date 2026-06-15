package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.payment.provider.PaymentCreateCommand;
import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;
import com.yunyan.billingapi.application.payment.provider.PaymentProviderRegistry;
import org.springframework.stereotype.Component;

@Component
public class WechatPaymentGateway implements PaymentGateway {

  private final PaymentProviderRegistry paymentProviderRegistry;

  public WechatPaymentGateway(PaymentProviderRegistry paymentProviderRegistry) {
    this.paymentProviderRegistry = paymentProviderRegistry;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.WECHAT;
  }

  @Override
  public PaymentCreateResult createPayment(
      String orderNo,
      long priceCents,
      String currency,
      String packageCode,
      String payScene,
      String wechatOpenId) {
    var scene = PaymentGateway.resolvePayScene(payScene);
    return paymentProviderRegistry
        .require(PaymentWebhookChannels.WECHAT)
        .createPayment(
            new PaymentCreateCommand(
                orderNo,
                priceCents,
                currency,
                packageCode,
                scene != null ? scene : PaymentPayScene.NATIVE,
                wechatOpenId));
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    var result =
        paymentProviderRegistry
            .require(PaymentWebhookChannels.WECHAT)
            .refund(orderNo, priceCents, currency, providerTradeNo);
    return new PaymentRefundResult(result.providerRefundNo(), result.async());
  }
}
