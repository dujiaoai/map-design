package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.domain.AuditWebhookDeliveryMetricRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookDeliveryMetric;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminAuditWebhookSlaServiceTest {

  @Mock private AuditWebhookDeliveryMetricRepository metricRepository;
  @Mock private AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock private SaasAppProperties saasAppProperties;

  @InjectMocks private AdminAuditWebhookSlaService service;

  @Test
  void getSlaSummary_computesDeliveryRate() {
    var metric = new AuditWebhookDeliveryMetric();
    metric.setSuccessCount(8);
    metric.setFailureCount(2);
    metric.setTotalLatencyMs(800);
    metric.setMetricDate(LocalDate.now(ZoneOffset.UTC));
    when(metricRepository.listSince(org.mockito.ArgumentMatchers.any())).thenReturn(List.of(metric));
    when(deadLetterRepository.countAll()).thenReturn(2L);
    when(deadLetterRepository.countPendingRetryCandidates(org.mockito.ArgumentMatchers.anyInt())).thenReturn(1L);
    var audit = new SaasAppProperties.Audit();
    audit.setDeadLetterMaxAttempts(5);
    when(saasAppProperties.getAudit()).thenReturn(audit);

    var sla = service.getSlaSummary();

    assertThat(sla.deliveryRatePercent()).isEqualTo(80.0);
    assertThat(sla.deadLetterCount()).isEqualTo(2L);
    assertThat(sla.pendingDeadLetters()).isEqualTo(1L);
  }
}
