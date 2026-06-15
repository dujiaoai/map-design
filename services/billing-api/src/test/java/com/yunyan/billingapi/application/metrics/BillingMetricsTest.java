package com.yunyan.billingapi.application.metrics;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

class BillingMetricsTest {

  @Test
  void countersIncrement() {
    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);

    metrics.recordRechargeCompleted();
    metrics.recordAdjustApplied();
    metrics.recordRefundCompleted();
    metrics.recordHoldCreated();
    metrics.recordHoldConfirmed();

    assertThat(registry.get("billing.recharge.completed").counter().count()).isEqualTo(1);
    assertThat(registry.get("billing.adjust.applied").counter().count()).isEqualTo(1);
    assertThat(registry.get("billing.refund.completed").counter().count()).isEqualTo(1);
    assertThat(registry.get("billing.hold.created").counter().count()).isEqualTo(1);
    assertThat(registry.get("billing.hold.confirmed").counter().count()).isEqualTo(1);
  }
}
