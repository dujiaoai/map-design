package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.security.TenantRlsBypass;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RefundingRecoveryJob {

  private final RefundingRecoveryService refundingRecoveryService;

  public RefundingRecoveryJob(RefundingRecoveryService refundingRecoveryService) {
    this.refundingRecoveryService = refundingRecoveryService;
  }

  @Scheduled(fixedDelayString = "${billing.refund.recovery-scan-ms:300000}")
  public void recoverStuckRefundingOrders() {
    TenantRlsBypass.run(() -> refundingRecoveryService.recoverStuckRefundingOrders());
  }
}
