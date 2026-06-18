package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.storage.ObjectStorageClient;
import com.yunyan.saasapi.config.SaasAppProperties;
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
  private static final String STATUS_FAILED = "failed";

  private final TenantDataExportRequestRepository exportRequestRepository;
  private final TenantDataExportCollector exportCollector;
  private final TenantDataExportZipBuilder exportZipBuilder;
  private final ObjectStorageClient objectStorageClient;
  private final SaasAppProperties saasAppProperties;

  @Scheduled(
      fixedDelayString = "${saas.tenant.data-export-complete-ms:600000}",
      initialDelayString = "${saas.tenant.data-export-complete-ms:600000}")
  public void completeProcessingExports() {
    var touched = 0;
    for (var request : exportRequestRepository.findPending(STATUS_PROCESSING, 20)) {
      if (completeRequest(request)) {
        touched++;
      }
    }
    if (touched > 0) {
      log.info("Tenant data export complete job finished {} request(s)", touched);
    }
  }

  private boolean completeRequest(TenantDataExportRequest request) {
    if (!STATUS_PROCESSING.equals(request.getStatus())) {
      return false;
    }
    try {
      var manifest = exportCollector.collect(request.getTenantId(), request);
      var zipBytes = exportZipBuilder.buildZip(manifest);
      var objectKey =
          saasAppProperties.getObjectStorage().getBucket()
              + "/"
              + request.getTenantId()
              + "/"
              + request.getId()
              + ".zip";
      var artifactUrl = objectStorageClient.upload(objectKey, zipBytes, "application/zip");
      request.setStatus(STATUS_COMPLETED);
      request.setArtifactObjectKey(objectKey);
      request.setArtifactUrl(artifactUrl);
      request.setCompletedAt(Instant.now());
      request.setErrorMessage(null);
      exportRequestRepository.update(request);
      return true;
    } catch (RuntimeException ex) {
      request.setStatus(STATUS_FAILED);
      request.setErrorMessage(ex.getMessage());
      exportRequestRepository.update(request);
      log.warn("Tenant data export failed for {}: {}", request.getId(), ex.getMessage());
      return true;
    }
  }
}
