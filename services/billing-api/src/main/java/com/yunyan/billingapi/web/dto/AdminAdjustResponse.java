package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record AdminAdjustResponse(
    UUID walletId,
    UUID tenantId,
    UUID userId,
    long amount,
    long balanceAfter,
    String remark,
    boolean idempotentReplay) {

  public static AdminAdjustResponse applied(
      UUID walletId, UUID tenantId, UUID userId, long amount, long balanceAfter, String remark) {
    return new AdminAdjustResponse(walletId, tenantId, userId, amount, balanceAfter, remark, false);
  }

  public static AdminAdjustResponse replay(
      UUID walletId, UUID tenantId, UUID userId, long amount, long balanceAfter, String remark) {
    return new AdminAdjustResponse(walletId, tenantId, userId, amount, balanceAfter, remark, true);
  }
}
