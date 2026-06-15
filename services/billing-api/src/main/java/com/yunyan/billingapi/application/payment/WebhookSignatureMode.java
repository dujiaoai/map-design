package com.yunyan.billingapi.application.payment;

public enum WebhookSignatureMode {
  HMAC,
  WECHAT_V3,
  ALIPAY_RSA;

  public static WebhookSignatureMode fromConfig(String value) {
    if (value == null || value.isBlank()) {
      return HMAC;
    }
    return switch (value.trim().toLowerCase().replace('-', '_')) {
      case "wechat_v3" -> WECHAT_V3;
      case "alipay_rsa" -> ALIPAY_RSA;
      default -> HMAC;
    };
  }
}
