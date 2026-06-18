package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantDataExportCompleteJob {

  private static final Logger log = LoggerFactory.getLogger(TenantDataExportCompleteJob.class);
  private static final String STATUS_PROCESSING = "processing";
  private static final String STATUS_COMPLETED = "completed";

  private final TenantDataExportRequestRepository exportRequestRepository;

  @Scheduled(
      fixedDelayString = "${saas.tenant.data-export-complete-ms:600000}",
      initialDelayString = "${saas.tenant.data-export-complete-ms:600000}")
  public void completeProcessingExports() {
    var touched = 0;
    for (var request : exportRequestRepository.findPending(STATUS_PROCESSING, 20)) {
      if (markCompleted(request)) {
        touched++;
      }
    }
    if (touched > 0) {
      log.info("Tenant data export complete job finished {} request(s)", touched);
    }
  }

  private boolean markCompleted(TenantDataExportRequest request) {
    if (!STATUS_PROCESSING.equals(request.getStatus())) {
      return false;
    }
    request.setStatus(STATUS_COMPLETED);
    request.setArtifactUrl("skeleton://tenant-export/" + request.getId() + ".zip");
    request.setCompletedAt(Instant.now());
    exportRequestRepository.update(request);
    return true;
  }
}
