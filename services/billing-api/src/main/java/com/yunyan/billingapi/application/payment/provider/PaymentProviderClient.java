package com.yunyan.billingapi.application.payment.provider;

import com.yunyan.billingapi.application.payment.PaymentCreateResult;
import com.yunyan.billingapi.application.payment.PaymentRefundResult;

public interface PaymentProviderClient {

  String channel();

  PaymentCreateResult createPayment(PaymentCreateCommand command);

  PaymentQueryResult queryPayment(String orderNo, String providerTradeNo);

  default PaymentRefundResult refund(
      String orderNo, long priceCents, String currency, String providerTradeNo) {
    throw com.yunyan.billingapi.security.AuthException.badRequest(
        "Refund not supported for channel: " + channel());
  }
}
