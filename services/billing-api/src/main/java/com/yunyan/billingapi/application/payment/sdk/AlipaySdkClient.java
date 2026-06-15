package com.yunyan.billingapi.application.payment.sdk;

import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;

public interface AlipaySdkClient {

  SdkCreateOrderResult createOrder(SdkCreateOrderRequest request);

  SdkQueryOrderResult queryByOutTradeNo(String outTradeNo);

  record SdkCreateOrderRequest(
      String orderNo,
      long priceCents,
      String currency,
      String subject,
      PaymentPayScene payScene,
      String notifyUrl) {}

  record SdkCreateOrderResult(String providerTradeNo, String payUrl, String payScene) {}

  record SdkQueryOrderResult(boolean paid, String providerTradeNo, long priceCents) {

    public static SdkQueryOrderResult unpaid() {
      return new SdkQueryOrderResult(false, null, 0L);
    }
  }
}
