package com.yunyan.saasapi.application.internal;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "saas.billing.membership-sync", name = "push-enabled", havingValue = "true")
public class MembershipSyncPushRetryJob {

  private static final Logger log = LoggerFactory.getLogger(MembershipSyncPushRetryJob.class);

  private final MembershipSyncPushRetryService membershipSyncPushRetryService;

  @Scheduled(
      fixedDelayString = "${saas.billing.membership-sync.push-retry-scan-ms:60000}")
  public void retryPendingMembershipPush() {
    var succeeded = membershipSyncPushRetryService.processPendingBatch();
    if (succeeded > 0) {
      log.info("Membership CDC push retry succeeded for {} event(s)", succeeded);
    }
  }
}
