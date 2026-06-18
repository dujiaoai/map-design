package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageDrDrillLogRepository;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.domain.entity.ObjectStorageDrDrillLog;
import com.yunyan.saasapi.web.dto.admin.ObjectStorageDrDrillResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ObjectStorageDrDrillService {

  private static final String SAMPLE_KEY = "dr-drill/sample.txt";

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageClient objectStorageClient;
  private final ObjectStorageDrDrillLogRepository drillLogRepository;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public ObjectStorageDrDrillResponse executeDrill(SaasPrincipal principal) {
    var storage = saasAppProperties.getObjectStorage();
    if (!StringUtils.hasText(storage.getDrDrillTargetBucket())) {
      return record(principal, "skipped", "drDrillTargetBucket not configured");
    }
    try {
      objectStorageClient.upload(SAMPLE_KEY, "dr-drill".getBytes(), "text/plain");
      var verified = objectStorageClient.exists(SAMPLE_KEY);
      if (!verified) {
        return record(principal, "failed", "sample object not found after upload");
      }
      return record(principal, "success", "sample object uploaded and verified");
    } catch (Exception ex) {
      return record(principal, "failed", ex.getMessage());
    }
  }

  private ObjectStorageDrDrillResponse record(SaasPrincipal principal, String status, String detail) {
    var row = new ObjectStorageDrDrillLog();
    row.setId(UUID.randomUUID());
    row.setStatus(status);
    row.setDetail(detail == null ? null : detail.substring(0, Math.min(detail.length(), 512)));
    row.setExecutedAt(Instant.now());
    drillLogRepository.insert(row);
    adminAuditLogService.recordPlatformUserAction(
        principal, "system.object_storage_dr_drill", null, "DR drill " + status + ": " + detail);
    return new ObjectStorageDrDrillResponse(status, detail, row.getExecutedAt().toEpochMilli());
  }
}
