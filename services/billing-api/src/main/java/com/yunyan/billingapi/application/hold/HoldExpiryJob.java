package com.yunyan.billingapi.application.hold;

import com.yunyan.billingapi.config.BillingAppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class HoldExpiryJob {

  private static final Logger log = LoggerFactory.getLogger(HoldExpiryJob.class);

  private final HoldService holdService;
  private final BillingAppProperties billingAppProperties;

  public HoldExpiryJob(HoldService holdService, BillingAppProperties billingAppProperties) {
    this.holdService = holdService;
    this.billingAppProperties = billingAppProperties;
  }

  @Scheduled(fixedDelayString = "${billing.hold.expire-scan-ms:300000}")
  public void cancelExpiredHolds() {
    var cancelled = holdService.cancelExpiredHolds(50);
    if (cancelled > 0) {
      log.info("Auto-cancelled {} expired billing holds", cancelled);
    }
  }
}
