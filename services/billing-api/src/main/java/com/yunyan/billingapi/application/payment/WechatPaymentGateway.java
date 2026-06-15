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
      String orderNo, long priceCents, String currency, String packageCode, String payScene) {
    var scene = PaymentGateway.resolvePayScene(payScene);
    return paymentProviderRegistry
        .require(PaymentWebhookChannels.WECHAT)
        .createPayment(
            new PaymentCreateCommand(
                orderNo,
                priceCents,
                currency,
                packageCode,
                scene != null ? scene : PaymentPayScene.NATIVE));
  }
}
