package com.yunyan.billingapi.application.payment;

public interface PaymentGateway {

  String channel();

  PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode);
}
