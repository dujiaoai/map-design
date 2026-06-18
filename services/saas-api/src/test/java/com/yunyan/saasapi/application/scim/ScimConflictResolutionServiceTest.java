package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.domain.TenantScimSyncConfigRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScimConflictResolutionServiceTest {

  @Mock private TenantScimSyncConfigRepository syncConfigRepository;

  @InjectMocks private ScimConflictResolutionService service;

  @Test
  void lastWriteWins_skipsStaleIncoming() {
    var tenantId = UUID.randomUUID();
    var event = new ScimSyncEvent();
    event.setTenantId(tenantId);
    event.setCreatedAt(Instant.parse("2026-01-01T00:00:00Z"));
    assertThat(
        service.shouldApplyIncoming(event, Instant.parse("2026-06-01T00:00:00Z")))
        .isFalse();
  }
}
