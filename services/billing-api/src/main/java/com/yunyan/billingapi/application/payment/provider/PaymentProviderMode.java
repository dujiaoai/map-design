package com.yunyan.billingapi.application.payment.provider;

public enum PaymentProviderMode {
  STUB,
  LIVE;

  public static PaymentProviderMode fromConfig(String raw) {
    if (raw == null || raw.isBlank()) {
      return STUB;
    }
    return switch (raw.trim().toLowerCase()) {
      case "live", "production", "prod" -> LIVE;
      default -> STUB;
    };
  }
}
