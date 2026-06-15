package com.yunyan.billingapi.application.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnExpression(
    "${billing.membership-sync.enabled:false} && !'cdc'.equals('${billing.membership-sync.source:local}')")
public class MembershipMirrorSyncJob {

  private static final Logger log = LoggerFactory.getLogger(MembershipMirrorSyncJob.class);

  private final MembershipMirrorSyncService membershipMirrorSyncService;

  public MembershipMirrorSyncJob(MembershipMirrorSyncService membershipMirrorSyncService) {
    this.membershipMirrorSyncService = membershipMirrorSyncService;
  }

  @Scheduled(fixedDelayString = "${billing.membership-sync.scan-ms:300000}")
  public void syncMembershipMirror() {
    try {
      var result = membershipMirrorSyncService.syncFromSaas();
      if (result.userCount() > 0 || result.featureCount() > 0) {
        log.info(
            "Synced membership mirror from saas DB: {} users, {} tenant features",
            result.userCount(),
            result.featureCount());
      }
    } catch (RuntimeException ex) {
      log.warn("Membership mirror sync failed: {}", ex.getMessage());
    }
  }
}
