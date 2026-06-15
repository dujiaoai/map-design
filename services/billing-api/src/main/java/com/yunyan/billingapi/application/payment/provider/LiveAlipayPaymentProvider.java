package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class LiveAlipayPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;

  public LiveAlipayPaymentProvider(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.ALIPAY;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var alipay = billingAppProperties.getPayment().getAlipay();
    assertConfigured(alipay.getAppId(), alipay.getPrivateKeyPem());
    var payScene = command.payScene() != null ? command.payScene() : PaymentPayScene.WAP;
    // SDK 接入点：alipay.trade.wap.pay / page.pay
    return new PaymentCreateResult(
        "alipay-live-pending-" + command.orderNo(),
        "https://openapi.alipay.com/pending-sdk/"
            + payScene.wireValue()
            + "?out_trade_no="
            + command.orderNo(),
        payScene.wireValue());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    var alipay = billingAppProperties.getPayment().getAlipay();
    assertConfigured(alipay.getAppId(), alipay.getPrivateKeyPem());
    // SDK 接入点：alipay.trade.query
    return PaymentQueryResult.unpaid();
  }

  private void assertConfigured(String appId, String privateKeyPem) {
    if (!StringUtils.hasText(appId) || !StringUtils.hasText(privateKeyPem)) {
      throw AuthException.badRequest(
          "Alipay live mode requires billing.payment.alipay.app-id and private-key-pem");
    }
  }
}
