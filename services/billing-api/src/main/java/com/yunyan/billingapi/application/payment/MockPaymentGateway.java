package com.yunyan.billingapi.application.payment;

import org.springframework.stereotype.Component;

@Component
public class MockPaymentGateway implements PaymentGateway {

  @Override
  public String channel() {
    return "mock";
  }

  @Override
  public PaymentCreateResult createPayment(
      String orderNo, long priceCents, String currency, String packageCode) {
    var tradeNo = "mock-" + orderNo;
    var payUrl = "mock://billing/recharge/" + orderNo;
    return new PaymentCreateResult(tradeNo, payUrl);
  }

  @Override
  public PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    return new PaymentRefundResult("mock-refund-" + orderNo, false);
  }
}
