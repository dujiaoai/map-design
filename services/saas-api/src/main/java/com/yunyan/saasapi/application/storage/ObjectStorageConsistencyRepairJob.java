package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.domain.ObjectStorageConsistencyCheckLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ObjectStorageConsistencyRepairJob {

  private static final Logger log = LoggerFactory.getLogger(ObjectStorageConsistencyRepairJob.class);

  private final ObjectStorageConsistencyCheckLogRepository checkLogRepository;

  @Scheduled(
      fixedDelayString = "${saas.object-storage.consistency-repair-ms:3600000}",
      initialDelayString = "${saas.object-storage.consistency-repair-ms:3600000}")
  public void repairMismatchedObjects() {
    var mismatched = checkLogRepository.listRecentMismatched(20);
    if (mismatched.isEmpty()) {
      return;
    }
    for (var row : mismatched) {
      log.info("Object storage consistency repair skeleton: re-copy {}", row.getObjectKey());
    }
  }
}
