package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record TransferResponse(
    UUID fromWalletId,
    UUID toWalletId,
    UUID fromUserId,
    UUID toUserId,
    long amount,
    long fromBalanceAfter,
    long toBalanceAfter,
    String remark,
    boolean idempotentReplay) {

  public static TransferResponse applied(
      UUID fromWalletId,
      UUID toWalletId,
      UUID fromUserId,
      UUID toUserId,
      long amount,
      long fromBalanceAfter,
      long toBalanceAfter,
      String remark) {
    return new TransferResponse(
        fromWalletId,
        toWalletId,
        fromUserId,
        toUserId,
        amount,
        fromBalanceAfter,
        toBalanceAfter,
        remark,
        false);
  }

  public static TransferResponse replay(
      UUID fromWalletId,
      UUID toWalletId,
      UUID fromUserId,
      UUID toUserId,
      long amount,
      long fromBalanceAfter,
      long toBalanceAfter,
      String remark) {
    return new TransferResponse(
        fromWalletId,
        toWalletId,
        fromUserId,
        toUserId,
        amount,
        fromBalanceAfter,
        toBalanceAfter,
        remark,
        true);
  }
}
