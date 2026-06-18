package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScimSyncEventProcessorJob {

  private static final Logger log = LoggerFactory.getLogger(ScimSyncEventProcessorJob.class);
  private static final int BATCH_SIZE = 50;

  private final ScimSyncEventRepository syncEventRepository;
  private final ScimConflictResolutionService conflictResolutionService;

  @Scheduled(
      fixedDelayString = "${saas.scim.sync-event-processor-ms:120000}",
      initialDelayString = "${saas.scim.sync-event-processor-ms:120000}")
  public void processPendingEvents() {
    var pending = syncEventRepository.listPending(BATCH_SIZE);
    if (pending.isEmpty()) {
      return;
    }
    for (var event : pending) {
      processEvent(event);
    }
  }

  private void processEvent(ScimSyncEvent event) {
    var apply = conflictResolutionService.shouldApplyIncoming(event, null);
    if (!apply) {
      log.info("Skipped SCIM sync event {} due to conflict strategy", event.getId());
    }
    event.setStatus(ScimSyncEventRepository.STATUS_RESOLVED);
    event.setResolvedAt(Instant.now());
    syncEventRepository.update(event);
  }
}
