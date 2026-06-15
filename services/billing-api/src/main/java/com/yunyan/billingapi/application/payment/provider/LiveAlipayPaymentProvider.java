package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.application.payment.sdk.AlipaySdkClient;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class LiveAlipayPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;
  private final AlipaySdkClient alipaySdkClient;

  public LiveAlipayPaymentProvider(
      BillingAppProperties billingAppProperties, AlipaySdkClient alipaySdkClient) {
    this.billingAppProperties = billingAppProperties;
    this.alipaySdkClient = alipaySdkClient;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.ALIPAY;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var alipay = billingAppProperties.getPayment().getAlipay();
    assertConfigured(alipay.getAppId(), alipay.getPrivateKeyPem(), alipay.getAlipayPublicKeyPem());
    var payScene = command.payScene() != null ? command.payScene() : PaymentPayScene.WAP;
    var notifyUrl = requireNotifyUrl(alipay.getNotifyUrl());
    var sdkResult =
        alipaySdkClient.createOrder(
            new AlipaySdkClient.SdkCreateOrderRequest(
                command.orderNo(),
                command.priceCents(),
                command.currency(),
                "YunYan recharge " + command.packageCode(),
                payScene,
                notifyUrl));
    return new PaymentCreateResult(
        sdkResult.providerTradeNo(), sdkResult.payUrl(), sdkResult.payScene());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    var alipay = billingAppProperties.getPayment().getAlipay();
    assertConfigured(alipay.getAppId(), alipay.getPrivateKeyPem(), alipay.getAlipayPublicKeyPem());
    var sdkResult = alipaySdkClient.queryByOutTradeNo(orderNo);
    if (!sdkResult.paid()) {
      return PaymentQueryResult.unpaid();
    }
    return PaymentQueryResult.paid(sdkResult.providerTradeNo(), sdkResult.priceCents());
  }

  private static void assertConfigured(
      String appId, String privateKeyPem, String alipayPublicKeyPem) {
    if (!StringUtils.hasText(appId)
        || !StringUtils.hasText(privateKeyPem)
        || !StringUtils.hasText(alipayPublicKeyPem)) {
      throw AuthException.badRequest(
          "Alipay live mode requires billing.payment.alipay app-id, private-key-pem,"
              + " alipay-public-key-pem");
    }
  }

  private static String requireNotifyUrl(String notifyUrl) {
    if (!StringUtils.hasText(notifyUrl)) {
      throw AuthException.badRequest("billing.payment.alipay.notify-url is required in live mode");
    }
    return notifyUrl.trim();
  }
}
