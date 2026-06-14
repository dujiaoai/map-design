package com.yunyan.saasapi.application.billing;

import org.springframework.http.HttpStatus;

public class BillingInsufficientBalanceException extends RuntimeException {

  private final long availableBalance;
  private final long requiredPoints;

  public BillingInsufficientBalanceException(long availableBalance, long requiredPoints) {
    super("Insufficient balance");
    this.availableBalance = availableBalance;
    this.requiredPoints = requiredPoints;
  }

  public HttpStatus getStatus() {
    return HttpStatus.PAYMENT_REQUIRED;
  }

  public long getAvailableBalance() {
    return availableBalance;
  }

  public long getRequiredPoints() {
    return requiredPoints;
  }
}
