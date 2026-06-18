package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageLifecycleAuditRepository;
import com.yunyan.saasapi.domain.entity.ObjectStorageLifecycleAudit;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ObjectStorageLifecycleService {

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageLifecycleAuditRepository auditRepository;

  public void recordRetentionPolicy(String objectKey) {
    var storage = saasAppProperties.getObjectStorage();
    var retainDays =
        storage.getComplianceRetainDays() > 0
            ? storage.getComplianceRetainDays()
            : storage.getLifecycleExpireDays();
    if (retainDays <= 0) {
      return;
    }
    var row = new ObjectStorageLifecycleAudit();
    row.setObjectKey(objectKey);
    row.setExpireDays(retainDays);
    row.setRecordedAt(Instant.now());
    auditRepository.insert(row);
  }
}
