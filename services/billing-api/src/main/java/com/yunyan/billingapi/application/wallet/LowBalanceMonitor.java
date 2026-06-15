package com.yunyan.billingapi.application.wallet;

import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.notification.BillingNotificationService;
import com.yunyan.billingapi.config.BillingAppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/** Records Micrometer events when available balance crosses below the configured threshold. */
@Component
public class LowBalanceMonitor {

  private static final Logger log = LoggerFactory.getLogger(LowBalanceMonitor.class);

  private final BillingAppProperties billingAppProperties;
  private final BillingMetrics billingMetrics;
  private final BillingNotificationService billingNotificationService;

  public LowBalanceMonitor(
      BillingAppProperties billingAppProperties,
      BillingMetrics billingMetrics,
      BillingNotificationService billingNotificationService) {
    this.billingAppProperties = billingAppProperties;
    this.billingMetrics = billingMetrics;
    this.billingNotificationService = billingNotificationService;
  }

  public void checkAvailableCrossing(
      WalletBalanceContext wallet, long previousAvailable, long newAvailable) {
    if (!billingAppProperties.getLowBalance().isEnabled()) {
      return;
    }
    var threshold = billingAppProperties.getLowBalance().getThreshold();
    if (previousAvailable >= threshold
        && newAvailable >= 0
        && newAvailable < threshold) {
      billingMetrics.recordLowBalance();
      log.info(
          "Wallet available balance crossed low threshold: tenant={}, user={}, previous={}, current={}, threshold={}",
          wallet.tenantId(),
          wallet.userId(),
          previousAvailable,
          newAvailable,
          threshold);
      billingNotificationService.notifyLowBalance(
          wallet.tenantId(), wallet.userId(), newAvailable, threshold);
    }
  }

  public static long available(long balance, long frozen) {
    return balance - frozen;
  }

  public static WalletBalanceContext context(
      java.util.UUID tenantId, java.util.UUID userId, java.util.UUID walletId) {
    return new WalletBalanceContext(tenantId, userId, walletId);
  }
}
