package com.yunyan.billingapi.application.coupon;

public enum CouponStackingMode {
  SINGLE;

  public static CouponStackingMode fromConfig(String raw) {
    if (raw == null || raw.isBlank()) {
      return SINGLE;
    }
    return switch (raw.trim().toLowerCase()) {
      default -> SINGLE;
    };
  }
}
