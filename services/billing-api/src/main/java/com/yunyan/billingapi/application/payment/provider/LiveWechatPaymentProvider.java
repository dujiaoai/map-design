package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class LiveWechatPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;

  public LiveWechatPaymentProvider(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.WECHAT;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var wechat = billingAppProperties.getPayment().getWechat();
    assertConfigured(wechat.getAppId(), wechat.getMchId(), wechat.getApiV3Key());
    var payScene = command.payScene() != null ? command.payScene() : PaymentPayScene.NATIVE;
    // SDK 接入点：Native / H5 / JSAPI 统一下单（WeChat Pay API v3）
    return new PaymentCreateResult(
        "wx-live-pending-" + command.orderNo(),
        "https://pay.wechat.example/pending-sdk/" + payScene.wireValue() + "?order=" + command.orderNo(),
        payScene.wireValue());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    var wechat = billingAppProperties.getPayment().getWechat();
    assertConfigured(wechat.getAppId(), wechat.getMchId(), wechat.getApiV3Key());
    // SDK 接入点：GET /v3/pay/transactions/out-trade-no/{orderNo}
    return PaymentQueryResult.unpaid();
  }

  private void assertConfigured(String appId, String mchId, String apiV3Key) {
    if (!StringUtils.hasText(appId) || !StringUtils.hasText(mchId) || !StringUtils.hasText(apiV3Key)) {
      throw AuthException.badRequest(
          "WeChat Pay live mode requires billing.payment.wechat.app-id, mch-id, api-v3-key");
    }
  }
}
