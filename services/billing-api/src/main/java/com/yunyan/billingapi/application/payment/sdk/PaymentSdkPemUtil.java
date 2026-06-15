package com.yunyan.billingapi.application.payment.sdk;

final class PaymentSdkPemUtil {

  private PaymentSdkPemUtil() {}

  static String normalizePem(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }
    return raw.replace("\\n", "\n").trim();
  }
}
