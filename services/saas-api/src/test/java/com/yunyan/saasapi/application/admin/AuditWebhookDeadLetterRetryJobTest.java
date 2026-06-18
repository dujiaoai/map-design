package com.yunyan.saasapi.application.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditWebhookDeadLetterRetryJobTest {

  @Mock AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock AuditWebhookHttpClient auditWebhookHttpClient;
  @Mock AuditWebhookHmacSigner hmacSigner;
  @Mock SaasAppProperties saasAppProperties;
  @Mock AuditWebhookAlertService alertService;

  @InjectMocks AuditWebhookDeadLetterRetryJob job;

  @BeforeEach
  void setUp() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setDeadLetterMaxAttempts(5);
    audit.setDeadLetterRetryIntervalMs(1L);
    when(saasAppProperties.getAudit()).thenReturn(audit);
  }

  @Test
  void retryDeadLetters_deletesOnSuccess() {
    var row = new SysAdminAuditWebhookDeadLetter();
    row.setId(UUID.randomUUID());
    row.setPayload("{}");
    row.setAttempts(1);
    row.setUpdatedAt(Instant.now().minusSeconds(60));
    when(deadLetterRepository.listEligibleForRetry(5, 20)).thenReturn(List.of(row));
    when(hmacSigner.sign(any(), any())).thenReturn("sig");
    when(auditWebhookHttpClient.postJson(any(), any(), any())).thenReturn(true);

    job.retryDeadLetters();

    verify(deadLetterRepository).deleteById(row.getId());
    verify(alertService, never()).routeDeadLetterAlert(any(Long.class), any());
  }

  @Test
  void retryDeadLetters_incrementsOnFailure() {
    var row = new SysAdminAuditWebhookDeadLetter();
    row.setId(UUID.randomUUID());
    row.setPayload("{}");
    row.setAttempts(2);
    row.setUpdatedAt(Instant.now().minusSeconds(60));
    when(deadLetterRepository.listEligibleForRetry(5, 20)).thenReturn(List.of(row));
    when(hmacSigner.sign(any(), any())).thenReturn("sig");
    when(auditWebhookHttpClient.postJson(any(), any(), any())).thenReturn(false);

    job.retryDeadLetters();

    verify(deadLetterRepository).incrementAttempts(eq(row.getId()), any());
    verify(alertService).routeDeadLetterAlert(any(Long.class), any());
  }
}
