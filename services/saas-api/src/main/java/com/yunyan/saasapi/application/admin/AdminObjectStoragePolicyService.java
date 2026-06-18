package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.storage.ObjectStorageEncryptionService;
import com.yunyan.saasapi.application.storage.ObjectStorageWormService;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageDrDrillLogRepository;
import com.yunyan.saasapi.domain.ObjectStorageLifecycleAuditRepository;
import com.yunyan.saasapi.web.dto.admin.AdminObjectStoragePolicyResponse;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminObjectStoragePolicyService {

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageLifecycleAuditRepository lifecycleAuditRepository;
  private final ObjectStorageEncryptionService encryptionService;
  private final ObjectStorageWormService wormService;
  private final ObjectStorageDrDrillLogRepository drillLogRepository;

  public AdminObjectStoragePolicyResponse getPolicySummary() {
    var storage = saasAppProperties.getObjectStorage();
    return new AdminObjectStoragePolicyResponse(
        storage.getProvider(),
        storage.getLifecycleExpireDays(),
        storage.getComplianceRetainDays(),
        StringUtils.hasText(storage.getReplicationTargetBucket()),
        storage.getReplicationRegion(),
        lifecycleAuditRepository.countAll(),
        encryptionService.isEncryptionConfigured(),
        wormService.isWormConfigured(),
        drillLogRepository.findLatestExecutedAt().map(Instant::toEpochMilli).orElse(null));
  }
}
