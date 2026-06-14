package com.yunyan.billingapi.application.recharge;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RechargeOrderExpiryJob {

  private static final Logger log = LoggerFactory.getLogger(RechargeOrderExpiryJob.class);

  private final RechargeOrderService rechargeOrderService;

  public RechargeOrderExpiryJob(RechargeOrderService rechargeOrderService) {
    this.rechargeOrderService = rechargeOrderService;
  }

  @Scheduled(fixedDelayString = "${billing.recharge.expire-scan-ms:300000}")
  public void expirePendingOrders() {
    var expired = rechargeOrderService.expirePendingOrders(50);
    if (expired > 0) {
      log.info("Auto-expired {} pending billing recharge orders", expired);
    }
  }
}
