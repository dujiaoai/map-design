package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AuditWebhookDeliveryMetricRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookDeliveryMetric;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditWebhookDeliveryMetricRecorder {

  private final AuditWebhookDeliveryMetricRepository metricRepository;

  public void recordSuccess(long latencyMs) {
    record(true, latencyMs);
  }

  public void recordFailure(long latencyMs) {
    record(false, latencyMs);
  }

  private void record(boolean success, long latencyMs) {
    var date = LocalDate.now(ZoneOffset.UTC);
    var row =
        metricRepository
            .findByDate(date)
            .orElseGet(
                () -> {
                  var created = new AuditWebhookDeliveryMetric();
                  created.setMetricDate(date);
                  created.setRecordedAt(Instant.now());
                  return created;
                });
    if (success) {
      row.setSuccessCount(row.getSuccessCount() + 1);
      row.setTotalLatencyMs(row.getTotalLatencyMs() + Math.max(latencyMs, 0));
    } else {
      row.setFailureCount(row.getFailureCount() + 1);
    }
    row.setRecordedAt(Instant.now());
    metricRepository.upsert(row);
  }
}
