package com.yunyan.saasapi.application.internal;

import com.yunyan.saasapi.domain.BillingMembershipSyncEventRepository;
import com.yunyan.saasapi.web.dto.internal.AckMembershipSyncEventsResponse;
import com.yunyan.saasapi.web.dto.internal.MembershipSyncEventDto;
import com.yunyan.saasapi.web.dto.internal.MembershipSyncEventListResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class InternalMembershipSyncService {

  private static final String PROCESSED_BY_BILLING = "billing-api";

  private final BillingMembershipSyncEventRepository eventRepository;

  public MembershipSyncEventListResponse listPendingEvents(int limit) {
    var normalizedLimit = Math.clamp(limit, 1, 500);
    var items =
        eventRepository.findPending(normalizedLimit).stream()
            .map(
                row ->
                    new MembershipSyncEventDto(
                        row.getId().toString(),
                        row.getEventType(),
                        row.getPayload(),
                        row.getCreatedAt() != null ? row.getCreatedAt().toString() : null))
            .toList();
    return new MembershipSyncEventListResponse(items);
  }

  public AckMembershipSyncEventsResponse acknowledge(List<String> eventIds) {
    var acknowledged = 0;
    var now = Instant.now();
    for (var rawId : eventIds) {
      if (!StringUtils.hasText(rawId)) {
        continue;
      }
      acknowledged += eventRepository.markProcessed(UUID.fromString(rawId.trim()), now, PROCESSED_BY_BILLING);
    }
    return new AckMembershipSyncEventsResponse(acknowledged);
  }
}
