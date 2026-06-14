package com.yunyan.billingapi.application.payment;

public interface PaymentGateway {

  String channel();

  PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode);

  default PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    throw com.yunyan.billingapi.security.AuthException.badRequest(
        "Refund not supported for channel: " + channel());
  }
}
