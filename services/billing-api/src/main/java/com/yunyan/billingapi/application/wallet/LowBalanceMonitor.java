package com.yunyan.billingapi.application.wallet;

import com.yunyan.billingapi.application.metrics.BillingMetrics;
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

  public LowBalanceMonitor(
      BillingAppProperties billingAppProperties, BillingMetrics billingMetrics) {
    this.billingAppProperties = billingAppProperties;
    this.billingMetrics = billingMetrics;
  }

  public void checkAvailableCrossing(long previousAvailable, long newAvailable) {
    if (!billingAppProperties.getLowBalance().isEnabled()) {
      return;
    }
    var threshold = billingAppProperties.getLowBalance().getThreshold();
    if (previousAvailable >= threshold
        && newAvailable >= 0
        && newAvailable < threshold) {
      billingMetrics.recordLowBalance();
      log.info(
          "Wallet available balance crossed low threshold: previous={}, current={}, threshold={}",
          previousAvailable,
          newAvailable,
          threshold);
    }
  }

  public static long available(long balance, long frozen) {
    return balance - frozen;
  }
}
