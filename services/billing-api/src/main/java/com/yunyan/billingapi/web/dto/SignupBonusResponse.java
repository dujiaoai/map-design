package com.yunyan.billingapi.web.dto;

import java.util.UUID;

public record SignupBonusResponse(
    UUID walletId, long grantedPoints, long balance, boolean alreadyGranted) {

  public static SignupBonusResponse granted(UUID walletId, long grantedPoints, long balance) {
    return new SignupBonusResponse(walletId, grantedPoints, balance, false);
  }

  public static SignupBonusResponse alreadyGranted(UUID walletId, long balance) {
    return new SignupBonusResponse(walletId, 0L, balance, true);
  }
}
