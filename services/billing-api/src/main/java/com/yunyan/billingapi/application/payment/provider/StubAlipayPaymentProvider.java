package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentRefundResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.config.BillingAppProperties;
import org.springframework.stereotype.Component;

@Component
public class StubAlipayPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;

  public StubAlipayPaymentProvider(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.ALIPAY;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var payScene = resolvePayScene(command.payScene());
    var payUrl =
        switch (payScene) {
          case WAP ->
              "https://openapi.alipay.com/gateway.do?method=alipay.trade.wap.pay&out_trade_no="
                  + command.orderNo();
          default ->
              "https://openapi.alipay.com/gateway.do?out_trade_no=" + command.orderNo();
        };
    return new PaymentCreateResult(
        "alipay-pending-" + command.orderNo(), payUrl, payScene.wireValue());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    return PaymentQueryResult.unpaid();
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    return new PaymentRefundResult("alipay-refund-" + orderNo, false);
  }

  private PaymentPayScene resolvePayScene(PaymentPayScene requested) {
    if (requested != null && requested != PaymentPayScene.NATIVE) {
      return requested;
    }
    return PaymentPayScene.fromConfig(billingAppProperties.getPayment().getAlipay().getDefaultPayScene());
  }
}
