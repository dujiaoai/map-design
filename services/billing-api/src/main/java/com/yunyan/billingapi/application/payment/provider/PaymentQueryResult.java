package com.yunyan.billingapi.application.payment.provider;

public record PaymentQueryResult(boolean paid, String providerTradeNo, Long priceCents) {

  public static PaymentQueryResult unpaid() {
    return new PaymentQueryResult(false, null, null);
  }

  public static PaymentQueryResult paid(String providerTradeNo, long priceCents) {
    return new PaymentQueryResult(true, providerTradeNo, priceCents);
  }
}
