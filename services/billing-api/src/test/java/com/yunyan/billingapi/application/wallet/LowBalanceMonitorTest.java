package com.yunyan.billingapi.application.wallet;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.config.BillingAppProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;

class LowBalanceMonitorTest {

  @Test
  void checkAvailableCrossing_incrementsMetricWhenCrossingBelowThreshold() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(true);
    properties.getLowBalance().setThreshold(50L);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var monitor = new LowBalanceMonitor(properties, metrics);

    monitor.checkAvailableCrossing(120, 40);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isEqualTo(1);
  }

  @Test
  void checkAvailableCrossing_skipsWhenAlreadyBelowThreshold() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(true);
    properties.getLowBalance().setThreshold(50L);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var monitor = new LowBalanceMonitor(properties, metrics);

    monitor.checkAvailableCrossing(30, 20);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isZero();
  }

  @Test
  void checkAvailableCrossing_skipsWhenDisabled() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(false);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var monitor = new LowBalanceMonitor(properties, metrics);

    monitor.checkAvailableCrossing(120, 10);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isZero();
  }
}
