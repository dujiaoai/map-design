package com.yunyan.billingapi.application.payment.provider;

public enum PaymentPayScene {
  NATIVE("native"),
  H5("h5"),
  JSAPI("jsapi"),
  WAP("wap");

  private final String wireValue;

  PaymentPayScene(String wireValue) {
    this.wireValue = wireValue;
  }

  public String wireValue() {
    return wireValue;
  }

  public static PaymentPayScene fromConfig(String raw) {
    if (raw == null || raw.isBlank()) {
      return NATIVE;
    }
    return switch (raw.trim().toLowerCase()) {
      case "h5" -> H5;
      case "jsapi" -> JSAPI;
      case "wap" -> WAP;
      default -> NATIVE;
    };
  }
}
