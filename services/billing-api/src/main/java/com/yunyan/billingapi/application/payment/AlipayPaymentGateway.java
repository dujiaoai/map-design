package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.payment.provider.PaymentCreateCommand;
import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;
import com.yunyan.billingapi.application.payment.provider.PaymentProviderRegistry;
import org.springframework.stereotype.Component;

@Component
public class AlipayPaymentGateway implements PaymentGateway {

  private final PaymentProviderRegistry paymentProviderRegistry;

  public AlipayPaymentGateway(PaymentProviderRegistry paymentProviderRegistry) {
    this.paymentProviderRegistry = paymentProviderRegistry;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.ALIPAY;
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
        .require(PaymentWebhookChannels.ALIPAY)
        .createPayment(
            new PaymentCreateCommand(
                orderNo,
                priceCents,
                currency,
                packageCode,
                scene != null ? scene : PaymentPayScene.WAP,
                wechatOpenId));
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    var result =
        paymentProviderRegistry
            .require(PaymentWebhookChannels.ALIPAY)
            .refund(orderNo, priceCents, currency, providerTradeNo);
    return new PaymentRefundResult(result.providerRefundNo(), result.async());
  }
}
