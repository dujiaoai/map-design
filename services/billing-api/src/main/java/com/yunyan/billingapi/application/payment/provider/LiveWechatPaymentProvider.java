package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentRefundResult;
import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.application.payment.sdk.WechatPaySdkClient;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class LiveWechatPaymentProvider implements PaymentProviderClient {

  private final BillingAppProperties billingAppProperties;
  private final WechatPaySdkClient wechatPaySdkClient;

  public LiveWechatPaymentProvider(
      BillingAppProperties billingAppProperties, WechatPaySdkClient wechatPaySdkClient) {
    this.billingAppProperties = billingAppProperties;
    this.wechatPaySdkClient = wechatPaySdkClient;
  }

  @Override
  public String channel() {
    return PaymentWebhookChannels.WECHAT;
  }

  @Override
  public PaymentCreateResult createPayment(PaymentCreateCommand command) {
    var wechat = billingAppProperties.getPayment().getWechat();
    assertConfigured(
        wechat.getAppId(),
        wechat.getMchId(),
        wechat.getApiV3Key(),
        wechat.getMerchantSerialNo(),
        wechat.getPrivateKeyPem());
    var payScene = command.payScene() != null ? command.payScene() : PaymentPayScene.NATIVE;
    var notifyUrl = requireNotifyUrl(wechat.getNotifyUrl());
    var sdkResult =
        wechatPaySdkClient.createOrder(
            new WechatPaySdkClient.SdkCreateOrderRequest(
                command.orderNo(),
                command.priceCents(),
                command.currency(),
                "YunYan recharge " + command.packageCode(),
                payScene,
                command.wechatOpenId(),
                notifyUrl));
    return new PaymentCreateResult(
        sdkResult.providerTradeNo(), sdkResult.payUrl(), sdkResult.payScene());
  }

  @Override
  public PaymentQueryResult queryPayment(String orderNo, String providerTradeNo) {
    var wechat = billingAppProperties.getPayment().getWechat();
    assertConfigured(
        wechat.getAppId(),
        wechat.getMchId(),
        wechat.getApiV3Key(),
        wechat.getMerchantSerialNo(),
        wechat.getPrivateKeyPem());
    var sdkResult = wechatPaySdkClient.queryByOutTradeNo(orderNo);
    if (!sdkResult.paid()) {
      return PaymentQueryResult.unpaid();
    }
    return PaymentQueryResult.paid(sdkResult.providerTradeNo(), sdkResult.priceCents());
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    var wechat = billingAppProperties.getPayment().getWechat();
    assertConfigured(
        wechat.getAppId(),
        wechat.getMchId(),
        wechat.getApiV3Key(),
        wechat.getMerchantSerialNo(),
        wechat.getPrivateKeyPem());
    var sdkResult = wechatPaySdkClient.refund(orderNo, priceCents, currency, providerTradeNo);
    return new PaymentRefundResult(sdkResult.providerRefundNo(), sdkResult.async());
  }

  private static void assertConfigured(
      String appId, String mchId, String apiV3Key, String merchantSerialNo, String privateKeyPem) {
    if (!StringUtils.hasText(appId)
        || !StringUtils.hasText(mchId)
        || !StringUtils.hasText(apiV3Key)
        || !StringUtils.hasText(merchantSerialNo)
        || !StringUtils.hasText(privateKeyPem)) {
      throw AuthException.badRequest(
          "WeChat Pay live mode requires billing.payment.wechat app-id, mch-id, api-v3-key,"
              + " merchant-serial-no, private-key-pem");
    }
  }

  private static String requireNotifyUrl(String notifyUrl) {
    if (!StringUtils.hasText(notifyUrl)) {
      throw AuthException.badRequest("billing.payment.wechat.notify-url is required in live mode");
    }
    return notifyUrl.trim();
  }
}
