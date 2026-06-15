package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentWebhookChannels;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import org.springframework.stereotype.Component;

@Component
public class PaymentProviderRegistry {

  private final BillingAppProperties billingAppProperties;
  private final StubWechatPaymentProvider stubWechat;
  private final StubAlipayPaymentProvider stubAlipay;
  private final LiveWechatPaymentProvider liveWechat;
  private final LiveAlipayPaymentProvider liveAlipay;

  public PaymentProviderRegistry(
      BillingAppProperties billingAppProperties,
      StubWechatPaymentProvider stubWechat,
      StubAlipayPaymentProvider stubAlipay,
      LiveWechatPaymentProvider liveWechat,
      LiveAlipayPaymentProvider liveAlipay) {
    this.billingAppProperties = billingAppProperties;
    this.stubWechat = stubWechat;
    this.stubAlipay = stubAlipay;
    this.liveWechat = liveWechat;
    this.liveAlipay = liveAlipay;
  }

  public PaymentProviderClient require(String channel) {
    var client =
        switch (channel) {
          case PaymentWebhookChannels.WECHAT -> resolveWechat();
          case PaymentWebhookChannels.ALIPAY -> resolveAlipay();
          default -> null;
        };
    if (client == null) {
      throw AuthException.badRequest("Unsupported payment channel: " + channel);
    }
    return client;
  }

  public boolean isLiveMode() {
    return PaymentProviderMode.fromConfig(billingAppProperties.getPayment().getProviderMode())
        == PaymentProviderMode.LIVE;
  }

  private PaymentProviderClient resolveWechat() {
    return isLiveMode() ? liveWechat : stubWechat;
  }

  private PaymentProviderClient resolveAlipay() {
    return isLiveMode() ? liveAlipay : stubAlipay;
  }
}
