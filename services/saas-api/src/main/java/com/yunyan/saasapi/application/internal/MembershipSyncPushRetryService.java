package com.yunyan.saasapi.application.internal;

import com.yunyan.saasapi.config.BillingApiProperties;
import com.yunyan.saasapi.domain.BillingMembershipSyncEventRepository;
import com.yunyan.saasapi.infrastructure.billing.BillingMembershipPushClient;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MembershipSyncPushRetryService {

  private final BillingApiProperties billingApiProperties;
  private final BillingMembershipSyncEventRepository eventRepository;
  private final ObjectProvider<BillingMembershipPushClient> billingMembershipPushClient;

  public int processPendingBatch() {
    if (!billingApiProperties.isEnabled()
        || !billingApiProperties.getMembershipSync().isPushEnabled()) {
      return 0;
    }

    var pushClient = billingMembershipPushClient.getIfAvailable();
    if (pushClient == null) {
      return 0;
    }

    var batchSize = Math.max(billingApiProperties.getMembershipSync().getPushRetryBatchSize(), 1);
    var pending = eventRepository.findPending(batchSize);
    if (pending.isEmpty()) {
      return 0;
    }

    var succeeded = 0;
    var now = Instant.now();
    for (var row : pending) {
      if (pushClient.pushMembershipEvent(
          row.getId().toString(), row.getEventType(), row.getPayload())) {
        eventRepository.markProcessed(
            row.getId(), now, MembershipSyncEventPublisher.PROCESSED_BY_PUSH);
        succeeded++;
        log.debug("Membership CDC push retry succeeded for event {}", row.getId());
      }
    }

    return succeeded;
  }
}
