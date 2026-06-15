package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentRefundResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.config.BillingAppProperties;
import org.springframework.stereotype.Component;

@Component
public class StubWechatPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;

  public StubWechatPaymentProvider(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.WECHAT;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var payScene = resolvePayScene(command.payScene());
    var payUrl =
        switch (payScene) {
          case H5 -> "https://pay.example/wechat/h5?order=" + command.orderNo();
          case JSAPI -> "weixin://jsapi?order=" + command.orderNo();
          default -> "weixin://wxpay/bizpayurl?pr=" + command.orderNo();
        };
    return new PaymentCreateResult("wx-pending-" + command.orderNo(), payUrl, payScene.wireValue());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    return PaymentQueryResult.unpaid();
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    return new PaymentRefundResult("wx-refund-" + orderNo, false);
  }

  private PaymentPayScene resolvePayScene(PaymentPayScene requested) {
    if (requested != null && requested != PaymentPayScene.NATIVE) {
      return requested;
    }
    return PaymentPayScene.fromConfig(billingAppProperties.getPayment().getWechat().getDefaultPayScene());
  }
}
