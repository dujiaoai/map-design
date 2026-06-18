package com.yunyan.saasapi.application.scim;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScimSyncEventProcessorJobTest {

  @Mock private ScimSyncEventRepository syncEventRepository;
  @Mock private ScimConflictResolutionService conflictResolutionService;

  @InjectMocks private ScimSyncEventProcessorJob job;

  @Test
  void processPendingEvents_resolvesBatch() {
    var event = new ScimSyncEvent();
    event.setId(UUID.randomUUID());
    event.setTenantId(UUID.randomUUID());
    when(syncEventRepository.listPending(50)).thenReturn(List.of(event));
    when(conflictResolutionService.shouldApplyIncoming(any(), any())).thenReturn(true);
    job.processPendingEvents();
    verify(syncEventRepository).update(any(ScimSyncEvent.class));
  }
}
