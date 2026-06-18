package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScimSyncEventPublisher {

  private final ScimSyncEventRepository syncEventRepository;

  public void publishUserChange(UUID tenantId, String externalId, String payload) {
    publish(tenantId, "user.change", externalId, payload);
  }

  public void publishGroupChange(UUID tenantId, String externalId, String payload) {
    publish(tenantId, "group.change", externalId, payload);
  }

  private void publish(UUID tenantId, String eventType, String externalId, String payload) {
    var event = new ScimSyncEvent();
    event.setId(UUID.randomUUID());
    event.setTenantId(tenantId);
    event.setEventType(eventType);
    event.setExternalId(externalId);
    event.setPayload(payload);
    event.setStatus(ScimSyncEventRepository.STATUS_PENDING);
    event.setCreatedAt(Instant.now());
    syncEventRepository.insert(event);
  }
}
