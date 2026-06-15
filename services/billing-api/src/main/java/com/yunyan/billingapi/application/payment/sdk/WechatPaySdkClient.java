package com.yunyan.billingapi.application.payment.sdk;

import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;

public interface WechatPaySdkClient {

  SdkCreateOrderResult createOrder(SdkCreateOrderRequest request);

  SdkQueryOrderResult queryByOutTradeNo(String outTradeNo);

  SdkRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo);

  record SdkCreateOrderRequest(
      String orderNo,
      long priceCents,
      String currency,
      String description,
      PaymentPayScene payScene,
      String wechatOpenId,
      String notifyUrl) {}

  record SdkCreateOrderResult(String providerTradeNo, String payUrl, String payScene) {}

  record SdkQueryOrderResult(boolean paid, String providerTradeNo, long priceCents) {

    public static SdkQueryOrderResult unpaid() {
      return new SdkQueryOrderResult(false, null, 0L);
    }
  }

  record SdkRefundResult(String providerRefundNo, boolean async) {}
}
