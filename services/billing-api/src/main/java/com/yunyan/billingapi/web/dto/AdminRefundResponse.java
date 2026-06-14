package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record AdminRefundResponse(
    String orderNo,
    UUID tenantId,
    UUID userId,
    String status,
    long pointsRefunded,
    long walletBalanceAfter,
    String reason,
    boolean idempotentReplay) {

  public static AdminRefundResponse applied(
      String orderNo,
      UUID tenantId,
      UUID userId,
      String status,
      long pointsRefunded,
      long walletBalanceAfter,
      String reason) {
    return new AdminRefundResponse(
        orderNo, tenantId, userId, status, pointsRefunded, walletBalanceAfter, reason, false);
  }

  public static AdminRefundResponse replay(
      String orderNo,
      UUID tenantId,
      UUID userId,
      String status,
      long pointsRefunded,
      long walletBalanceAfter,
      String reason) {
    return new AdminRefundResponse(
        orderNo, tenantId, userId, status, pointsRefunded, walletBalanceAfter, reason, true);
  }
}
