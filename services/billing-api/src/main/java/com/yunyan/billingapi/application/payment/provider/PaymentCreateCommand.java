package com.yunyan.billingapi.application.payment.provider;

public record PaymentCreateCommand(
    String orderNo,
    long priceCents,
    String currency,
    String packageCode,
    PaymentPayScene payScene,
    String wechatOpenId) {

  public PaymentCreateCommand(
      String orderNo, long priceCents, String currency, String packageCode) {
    this(orderNo, priceCents, currency, packageCode, PaymentPayScene.NATIVE, null);
  }

  public PaymentCreateCommand(
      String orderNo,
      long priceCents,
      String currency,
      String packageCode,
      PaymentPayScene payScene) {
    this(orderNo, priceCents, currency, packageCode, payScene, null);
  }
}
