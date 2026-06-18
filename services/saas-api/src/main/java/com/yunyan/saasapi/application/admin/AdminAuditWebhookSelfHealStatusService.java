package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AuditWebhookSlaSnapshotRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookSlaSnapshot;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookSelfHealStatusResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookSelfHealStatusService {

  private final AuditWebhookSlaSelfHealService selfHealService;
  private final AdminAuditWebhookSlaService slaService;
  private final AuditWebhookSlaSnapshotRepository snapshotRepository;

  public AdminAuditWebhookSelfHealStatusResponse getStatus() {
    var degraded = selfHealService.countDegradedTargets();
    var eligible = selfHealService.countEligibleForSelfHeal();
    var sla = slaService.getSlaSummary();
    recordDailySnapshot(sla.deliveryRatePercent(), sla.avgLatencyMs(), sla.deadLetterCount());
    return new AdminAuditWebhookSelfHealStatusResponse(
        degraded, eligible, sla.deliveryRatePercent(), sla.pendingDeadLetters());
  }

  private void recordDailySnapshot(double deliveryRate, double avgLatencyMs, long deadLetters) {
    var today = LocalDate.now(ZoneOffset.UTC);
    var snapshot = new AuditWebhookSlaSnapshot();
    snapshot.setSnapshotDate(today);
    snapshot.setDeliveryRate(deliveryRate);
    snapshot.setAvgLatencyMs(avgLatencyMs);
    snapshot.setDeadLetterCount(deadLetters);
    snapshot.setCreatedAt(Instant.now());
    snapshotRepository.upsert(snapshot);
  }
}
