package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantDataExportProcessJob {

  private static final Logger log = LoggerFactory.getLogger(TenantDataExportProcessJob.class);
  private static final String STATUS_PENDING = "pending";
  private static final String STATUS_PROCESSING = "processing";

  private final TenantDataExportRequestRepository exportRequestRepository;

  @Scheduled(
      fixedDelayString = "${saas.tenant.data-export-process-ms:600000}",
      initialDelayString = "${saas.tenant.data-export-process-ms:600000}")
  public void processPendingExports() {
    var touched = 0;
    for (var request : exportRequestRepository.findPending(STATUS_PENDING, 20)) {
      if (markProcessing(request)) {
        touched++;
      }
    }
    if (touched > 0) {
      log.info("Tenant data export process job marked {} request(s) as processing", touched);
    }
  }

  private boolean markProcessing(TenantDataExportRequest request) {
    if (!STATUS_PENDING.equals(request.getStatus())) {
      return false;
    }
    request.setStatus(STATUS_PROCESSING);
    exportRequestRepository.update(request);
    return true;
  }
}
