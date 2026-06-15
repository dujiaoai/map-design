package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.application.payment.provider.PaymentPayScene;

public record PaymentCreateResult(String providerTradeNo, String payUrl, String payScene) {

  public PaymentCreateResult(String providerTradeNo, String payUrl) {
    this(providerTradeNo, payUrl, PaymentPayScene.NATIVE.wireValue());
  }
}
