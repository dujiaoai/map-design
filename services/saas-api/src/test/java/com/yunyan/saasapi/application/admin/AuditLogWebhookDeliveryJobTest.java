package com.yunyan.saasapi.application.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookCursorRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditLogWebhookDeliveryJobTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private AuditWebhookHttpClient auditWebhookHttpClient;
  @Mock private AdminAuditLogRepository adminAuditLogRepository;
  @Mock private AdminAuditWebhookCursorRepository cursorRepository;
  @Mock private AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock private AuditWebhookPayloadBuilder payloadBuilder;
  @Mock private AuditWebhookHmacSigner hmacSigner;
  @Mock private AuditWebhookAlertService alertService;

  @InjectMocks private AuditLogWebhookDeliveryJob job;

  @Test
  void deliverPendingAuditEvents_skipsWhenDisabled() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(false);
    when(saasAppProperties.getAudit()).thenReturn(audit);

    job.deliverPendingAuditEvents();

    verify(adminAuditLogRepository, never()).findUndeliveredAfter(any(), anyInt());
  }

  @Test
  void deliverPendingAuditEvents_skipsWhenNoPendingEvents() {
    var audit = enabledAudit();
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(cursorRepository.findDefault()).thenReturn(Optional.empty());
    when(adminAuditLogRepository.findUndeliveredAfter(null, 50)).thenReturn(List.of());

    job.deliverPendingAuditEvents();

    verify(auditWebhookHttpClient, never()).postJson(anyString(), anyString(), anyString());
  }

  @Test
  void deliverPendingAuditEvents_postsBatchAndUpdatesCursor() {
    var audit = enabledAudit();
    var log = sampleLog();
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(cursorRepository.findDefault()).thenReturn(Optional.empty());
    when(adminAuditLogRepository.findUndeliveredAfter(null, 50)).thenReturn(List.of(log));
    when(payloadBuilder.buildBatchPayload("jsonl", List.of(log))).thenReturn("{\"events\":[]}");
    when(hmacSigner.sign(audit.getWebhookSigningSecret(), "{\"events\":[]}")).thenReturn("abc123");
    when(auditWebhookHttpClient.postJson(audit.getWebhookUrl(), "{\"events\":[]}", "abc123"))
        .thenReturn(true);

    job.deliverPendingAuditEvents();

    verify(cursorRepository).upsert(log.getId(), log.getCreatedAt());
    verify(deadLetterRepository, never()).insert(any(), anyString(), anyString());
    verify(alertService, never()).notifyIfDeadLettersAccumulated(anyInt());
  }

  @Test
  void deliverPendingAuditEvents_writesDeadLetterOnFailure() {
    var audit = enabledAudit();
    var log = sampleLog();
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(cursorRepository.findDefault()).thenReturn(Optional.empty());
    when(adminAuditLogRepository.findUndeliveredAfter(null, 50)).thenReturn(List.of(log));
    when(payloadBuilder.buildBatchPayload("jsonl", List.of(log))).thenReturn("{\"events\":[]}");
    when(hmacSigner.sign(audit.getWebhookSigningSecret(), "{\"events\":[]}")).thenReturn("abc123");
    when(auditWebhookHttpClient.postJson(audit.getWebhookUrl(), "{\"events\":[]}", "abc123"))
        .thenReturn(false);
    when(payloadBuilder.buildSingleEventPayload(log)).thenReturn("{\"id\":\"x\"}\n");

    job.deliverPendingAuditEvents();

    verify(deadLetterRepository).insert(eq(log.getId()), eq("{\"id\":\"x\"}\n"), eq("HTTP delivery failed"));
    verify(alertService).notifyIfDeadLettersAccumulated(1);
    verify(cursorRepository, never()).upsert(any(), any());
  }

  private static SaasAppProperties.Audit enabledAudit() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setWebhookFormat("jsonl");
    audit.setWebhookBatchSize(50);
    audit.setWebhookSigningSecret("signing-secret");
    return audit;
  }

  private static SysAdminAuditLog sampleLog() {
    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(UUID.randomUUID());
    log.setActorEmail("admin@test.local");
    log.setAction("tenant.update");
    log.setResourceType("tenant");
    log.setCrossTenant(false);
    log.setCreatedAt(Instant.now());
    return log;
  }
}
