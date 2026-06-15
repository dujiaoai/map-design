package com.yunyan.billingapi.application.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PendingPaymentQueryJob {

  private static final Logger log = LoggerFactory.getLogger(PendingPaymentQueryJob.class);

  private final PendingPaymentQueryService pendingPaymentQueryService;

  public PendingPaymentQueryJob(PendingPaymentQueryService pendingPaymentQueryService) {
    this.pendingPaymentQueryService = pendingPaymentQueryService;
  }

  @Scheduled(fixedDelayString = "${billing.payment.query-scan-ms:300000}")
  public void pollPendingOnlinePayments() {
    var credited = pendingPaymentQueryService.pollPendingOnlinePayments(50);
    if (credited > 0) {
      log.info("Credited {} pending billing recharge orders via payment query", credited);
    }
  }
}
