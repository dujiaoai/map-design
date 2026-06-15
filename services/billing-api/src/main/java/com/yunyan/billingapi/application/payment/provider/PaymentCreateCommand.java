package com.yunyan.billingapi.application.payment.provider;

public record PaymentCreateCommand(
    String orderNo, long priceCents, String currency, String packageCode, PaymentPayScene payScene) {

  public PaymentCreateCommand(
      String orderNo, long priceCents, String currency, String packageCode) {
    this(orderNo, priceCents, currency, packageCode, PaymentPayScene.NATIVE);
  }
}
