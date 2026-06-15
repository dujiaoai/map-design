package com.yunyan.billingapi.application.tenant;

import com.yunyan.billingapi.application.tenant.MembershipMirrorApplyService.MembershipMirrorSyncEvent;
import com.yunyan.billingapi.infrastructure.saas.SaasMembershipSyncEventClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "source", havingValue = "cdc")
public class MembershipMirrorCdcService {

  private final SaasMembershipSyncEventClient saasMembershipSyncEventClient;
  private final MembershipMirrorApplyService membershipMirrorApplyService;

  public MembershipMirrorCdcService(
      SaasMembershipSyncEventClient saasMembershipSyncEventClient,
      MembershipMirrorApplyService membershipMirrorApplyService) {
    this.saasMembershipSyncEventClient = saasMembershipSyncEventClient;
    this.membershipMirrorApplyService = membershipMirrorApplyService;
  }

  @Transactional
  public int syncPendingEvents(int limit) {
    var events = saasMembershipSyncEventClient.fetchPending(limit);
    if (events.isEmpty()) {
      return 0;
    }
    var mirrorEvents =
        events.stream()
            .map(
                event ->
                    new MembershipMirrorSyncEvent(event.id(), event.eventType(), event.payload()))
            .toList();
    var applied = membershipMirrorApplyService.applyEvents(mirrorEvents);
    saasMembershipSyncEventClient.acknowledge(events.stream().map(SaasMembershipSyncEventClient.MembershipSyncEvent::id).toList());
    return applied;
  }
}
