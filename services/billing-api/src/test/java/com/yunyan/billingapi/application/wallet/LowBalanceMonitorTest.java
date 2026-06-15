package com.yunyan.billingapi.application.wallet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.notification.BillingNotificationService;
import com.yunyan.billingapi.config.BillingAppProperties;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class LowBalanceMonitorTest {

  @Test
  void checkAvailableCrossing_incrementsMetricWhenCrossingBelowThreshold() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(true);
    properties.getLowBalance().setThreshold(50L);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var notifications = mock(BillingNotificationService.class);
    var monitor = new LowBalanceMonitor(properties, metrics, notifications);
    var wallet =
        new WalletBalanceContext(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

    monitor.checkAvailableCrossing(wallet, 120, 40);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isEqualTo(1);
    verify(notifications).notifyLowBalance(eq(wallet.tenantId()), eq(wallet.userId()), eq(40L), eq(50L));
  }

  @Test
  void checkAvailableCrossing_skipsWhenAlreadyBelowThreshold() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(true);
    properties.getLowBalance().setThreshold(50L);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var notifications = mock(BillingNotificationService.class);
    var monitor = new LowBalanceMonitor(properties, metrics, notifications);
    var wallet =
        new WalletBalanceContext(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

    monitor.checkAvailableCrossing(wallet, 30, 20);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isZero();
    verify(notifications, never()).notifyLowBalance(eq(wallet.tenantId()), eq(wallet.userId()), anyLong(), anyLong());
  }

  @Test
  void checkAvailableCrossing_skipsWhenDisabled() {
    var properties = new BillingAppProperties();
    properties.getLowBalance().setEnabled(false);

    var registry = new SimpleMeterRegistry();
    var metrics = new BillingMetrics(registry);
    var notifications = mock(BillingNotificationService.class);
    var monitor = new LowBalanceMonitor(properties, metrics, notifications);
    var wallet =
        new WalletBalanceContext(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());

    monitor.checkAvailableCrossing(wallet, 120, 10);

    assertThat(registry.get("billing.wallet.low_balance").counter().count()).isZero();
    verify(notifications, never()).notifyLowBalance(eq(wallet.tenantId()), eq(wallet.userId()), anyLong(), anyLong());
  }
}
