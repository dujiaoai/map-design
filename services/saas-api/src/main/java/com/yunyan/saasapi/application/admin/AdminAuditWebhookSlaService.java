package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.domain.AuditWebhookDeliveryMetricRepository;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookSlaResponse;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookSlaService {

  private static final int WINDOW_DAYS = 7;

  private final AuditWebhookDeliveryMetricRepository metricRepository;
  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final SaasAppProperties saasAppProperties;

  public AdminAuditWebhookSlaResponse getSlaSummary() {
    var today = LocalDate.now(ZoneOffset.UTC);
    var from = today.minusDays(WINDOW_DAYS - 1L);
    var metrics = metricRepository.listSince(from);
    long success = 0;
    long failure = 0;
    long totalLatency = 0;
    for (var metric : metrics) {
      success += metric.getSuccessCount();
      failure += metric.getFailureCount();
      totalLatency += metric.getTotalLatencyMs();
    }
    var attempts = success + failure;
    var deliveryRate = attempts == 0 ? 100.0 : (success * 100.0) / attempts;
    var avgLatencyMs = success == 0 ? 0.0 : (double) totalLatency / success;
    var deadLetters = deadLetterRepository.countAll();
    var pending =
        deadLetterRepository.countPendingRetryCandidates(
            saasAppProperties.getAudit().getDeadLetterMaxAttempts());
    return new AdminAuditWebhookSlaResponse(
        WINDOW_DAYS, deliveryRate, avgLatencyMs, pending, deadLetters);
  }
}
