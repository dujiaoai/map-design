package com.yunyan.billingapi.application.tenant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "source", havingValue = "cdc")
public class MembershipCdcSyncJob {

  private static final Logger log = LoggerFactory.getLogger(MembershipCdcSyncJob.class);

  private final MembershipMirrorCdcService membershipMirrorCdcService;

  public MembershipCdcSyncJob(MembershipMirrorCdcService membershipMirrorCdcService) {
    this.membershipMirrorCdcService = membershipMirrorCdcService;
  }

  @Scheduled(fixedDelayString = "${billing.membership-sync.scan-ms:300000}")
  public void pullMembershipEvents() {
    try {
      var applied = membershipMirrorCdcService.syncPendingEvents(100);
      if (applied > 0) {
        log.info("Applied {} membership CDC events from saas-api", applied);
      }
    } catch (RuntimeException ex) {
      log.warn("Membership CDC sync failed: {}", ex.getMessage());
    }
  }
}
