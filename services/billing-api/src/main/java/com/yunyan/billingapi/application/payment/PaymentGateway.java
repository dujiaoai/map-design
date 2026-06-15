package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;

public interface PaymentGateway {

  String channel();

  PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode, String payScene);

  default PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode) {
    return createPayment(orderNo, priceCents, currency, packageCode, null);
  }

  default PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    throw com.yunyan.billingapi.security.AuthException.badRequest(
        "Refund not supported for channel: " + channel());
  }

  static PaymentPayScene resolvePayScene(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    return PaymentPayScene.fromConfig(raw);
  }
}
