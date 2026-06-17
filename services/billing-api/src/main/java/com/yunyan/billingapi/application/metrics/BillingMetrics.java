package com.yunyan.billingapi.application.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class BillingMetrics {

  private final Counter rechargeCompleted;
  private final Counter adjustApplied;
  private final Counter refundCompleted;
  private final Counter holdCreated;
  private final Counter holdConfirmed;
  private final Counter lowBalance;
  private final Counter reconciliationUnbalanced;

  public BillingMetrics(MeterRegistry meterRegistry) {
    this.rechargeCompleted =
        Counter.builder("billing.recharge.completed")
            .description("Completed recharge orders credited to wallets")
            .register(meterRegistry);
    this.adjustApplied =
        Counter.builder("billing.adjust.applied")
            .description("Admin wallet adjust operations applied")
            .register(meterRegistry);
    this.refundCompleted =
        Counter.builder("billing.refund.completed")
            .description("Admin recharge refunds completed")
            .register(meterRegistry);
    this.holdCreated =
        Counter.builder("billing.hold.created")
            .description("Internal hold requests that froze points")
            .register(meterRegistry);
    this.holdConfirmed =
        Counter.builder("billing.hold.confirmed")
            .description("Held consumption records confirmed")
            .register(meterRegistry);
    this.lowBalance =
        Counter.builder("billing.wallet.low_balance")
            .description("Wallets whose available balance crossed below the low threshold")
            .register(meterRegistry);
    this.reconciliationUnbalanced =
        Counter.builder("billing.reconciliation.unbalanced")
            .description("Daily reconciliation runs that detected order vs ledger mismatch")
            .register(meterRegistry);
  }

  public void recordRechargeCompleted() {
    rechargeCompleted.increment();
  }

  public void recordAdjustApplied() {
    adjustApplied.increment();
  }

  public void recordRefundCompleted() {
    refundCompleted.increment();
  }

  public void recordHoldCreated() {
    holdCreated.increment();
  }

  public void recordHoldConfirmed() {
    holdConfirmed.increment();
  }

  public void recordLowBalance() {
    lowBalance.increment();
  }

  public void recordReconciliationUnbalanced() {
    reconciliationUnbalanced.increment();
  }
}
