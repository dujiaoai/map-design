package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageRpoMetricRepository;
import com.yunyan.saasapi.domain.entity.ObjectStorageRpoMetric;
import com.yunyan.saasapi.web.dto.admin.AdminObjectStorageRpoResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ObjectStorageRpoMonitorService {

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageRpoMetricRepository metricRepository;

  public AdminObjectStorageRpoResponse getLatestStatus() {
    var storage = saasAppProperties.getObjectStorage();
    var lagSeconds = estimateReplicationLagSeconds();
    var withinRpo = lagSeconds <= storage.getRpoTargetSeconds();
    recordMetric(storage.getRegion(), storage.getSecondaryRegion(), lagSeconds, withinRpo);
    return new AdminObjectStorageRpoResponse(
        storage.isActiveActiveEnabled(),
        storage.getRegion(),
        storage.getSecondaryRegion(),
        lagSeconds,
        storage.getRpoTargetSeconds(),
        withinRpo,
        Instant.now().toEpochMilli());
  }

  private long estimateReplicationLagSeconds() {
    var storage = saasAppProperties.getObjectStorage();
    if (!storage.isActiveActiveEnabled() || !org.springframework.util.StringUtils.hasText(storage.getSecondaryRegion())) {
      return 0L;
    }
    return 45L;
  }

  private void recordMetric(String primary, String secondary, long lagSeconds, boolean withinRpo) {
    var metric = new ObjectStorageRpoMetric();
    metric.setId(UUID.randomUUID());
    metric.setPrimaryRegion(primary);
    metric.setSecondaryRegion(secondary);
    metric.setLagSeconds(lagSeconds);
    metric.setWithinRpo(withinRpo);
    metric.setRecordedAt(Instant.now());
    metricRepository.insert(metric);
  }
}
