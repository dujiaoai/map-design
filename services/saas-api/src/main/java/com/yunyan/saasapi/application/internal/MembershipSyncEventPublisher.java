package com.yunyan.saasapi.application.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.domain.BillingMembershipSyncEventRepository;
import com.yunyan.saasapi.domain.entity.BillingMembershipSyncEvent;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.infrastructure.billing.BillingMembershipPushClient;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MembershipSyncEventPublisher {

  private static final Logger log = LoggerFactory.getLogger(MembershipSyncEventPublisher.class);
  private static final String PROCESSED_BY_PUSH = "billing-api-push";

  public static final String EVENT_USER_UPSERT = "user_upsert";
  public static final String EVENT_TENANT_FEATURES_REPLACE = "tenant_features_replace";

  private final BillingMembershipSyncEventRepository eventRepository;
  private final ObjectMapper objectMapper;
  private final ObjectProvider<BillingMembershipPushClient> billingMembershipPushClient;

  public void publishUserUpsert(SysUser user) {
    if (user == null || user.getId() == null || user.getTenantId() == null) {
      return;
    }
    var payload = new LinkedHashMap<String, Object>();
    payload.put("id", user.getId().toString());
    payload.put("tenantId", user.getTenantId().toString());
    payload.put("email", user.getEmail() != null ? user.getEmail() : "");
    payload.put("status", user.getStatus() != null ? user.getStatus() : "");
    publish(EVENT_USER_UPSERT, payload);
  }

  public void publishTenantFeaturesReplace(UUID tenantId, List<String> featureCodes) {
    if (tenantId == null) {
      return;
    }
    var payload = new LinkedHashMap<String, Object>();
    payload.put("tenantId", tenantId.toString());
    payload.put("featureCodes", featureCodes != null ? featureCodes : List.of());
    publish(EVENT_TENANT_FEATURES_REPLACE, payload);
  }

  private void publish(String eventType, Map<String, Object> payload) {
    try {
      var row = new BillingMembershipSyncEvent();
      row.setId(UUID.randomUUID());
      row.setEventType(eventType);
      row.setPayload(objectMapper.writeValueAsString(payload));
      row.setCreatedAt(Instant.now());
      eventRepository.insert(row);
      tryPushAndAck(row);
    } catch (JsonProcessingException ex) {
      log.warn("Failed to serialize membership sync event {}: {}", eventType, ex.getMessage());
    } catch (RuntimeException ex) {
      log.warn("Failed to enqueue membership sync event {}: {}", eventType, ex.getMessage());
    }
  }

  private void tryPushAndAck(BillingMembershipSyncEvent row) {
    var pushClient = billingMembershipPushClient.getIfAvailable();
    if (pushClient == null) {
      return;
    }
    if (pushClient.pushMembershipEvent(row.getId().toString(), row.getEventType(), row.getPayload())) {
      eventRepository.markProcessed(row.getId(), Instant.now(), PROCESSED_BY_PUSH);
    }
  }
}
