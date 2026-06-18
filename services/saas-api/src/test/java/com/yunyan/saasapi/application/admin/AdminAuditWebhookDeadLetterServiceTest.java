package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
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
class AdminAuditWebhookDeadLetterServiceTest {

  private static final UUID DEAD_LETTER_ID = UUID.fromString("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
  private static final UUID LOG_ID = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

  @Mock private AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock private AuditWebhookHttpClient auditWebhookHttpClient;
  @Mock private AuditWebhookHmacSigner hmacSigner;
  @Mock private SaasAppProperties saasAppProperties;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private AdminAuditWebhookDeadLetterService service;

  @Test
  void replay_success_deletesDeadLetter() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setWebhookSigningSecret("secret");
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(deadLetterRepository.findById(DEAD_LETTER_ID)).thenReturn(Optional.of(sampleRow()));
    when(hmacSigner.sign("secret", "{\"event\":1}")).thenReturn("abc123");
    when(auditWebhookHttpClient.postJson("https://siem.example/hook", "{\"event\":1}", "abc123"))
        .thenReturn(true);

    var response = service.replay(samplePrincipal(), DEAD_LETTER_ID);

    assertThat(response.success()).isTrue();
    verify(deadLetterRepository).deleteById(DEAD_LETTER_ID);
    verify(adminAuditLogService)
        .recordPlatformUserAction(any(), eq("audit.webhook.dead-letter.replay"), eq(null), any());
  }

  @Test
  void replay_httpFailure_incrementsAttempts() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(deadLetterRepository.findById(DEAD_LETTER_ID)).thenReturn(Optional.of(sampleRow()));
    when(hmacSigner.sign(any(), any())).thenReturn("");
    when(auditWebhookHttpClient.postJson(any(), any(), any())).thenReturn(false);

    var response = service.replay(samplePrincipal(), DEAD_LETTER_ID);

    assertThat(response.success()).isFalse();
    verify(deadLetterRepository).incrementAttempts(DEAD_LETTER_ID, "Manual replay HTTP failed");
    verify(deadLetterRepository, never()).deleteById(any());
  }

  @Test
  void delete_missingDeadLetter_throwsNotFound() {
    when(deadLetterRepository.findById(DEAD_LETTER_ID)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> service.delete(samplePrincipal(), DEAD_LETTER_ID))
        .isInstanceOf(AuthException.class);
  }

  @Test
  void list_mapsRows() {
    when(deadLetterRepository.list(1, 20))
        .thenReturn(new com.yunyan.saasapi.domain.AdminPagedResult<>(List.of(sampleRow()), 1L));

    var response = service.list(1, 20);

    assertThat(response.items()).hasSize(1);
    assertThat(response.items().getFirst().logId()).isEqualTo(LOG_ID.toString());
    assertThat(response.total()).isEqualTo(1L);
  }

  private static SysAdminAuditWebhookDeadLetter sampleRow() {
    var row = new SysAdminAuditWebhookDeadLetter();
    row.setId(DEAD_LETTER_ID);
    row.setLogId(LOG_ID);
    row.setPayload("{\"event\":1}");
    row.setAttempts(2);
    row.setLastError("HTTP delivery failed");
    row.setCreatedAt(Instant.parse("2026-06-01T00:00:00Z"));
    row.setUpdatedAt(Instant.parse("2026-06-01T01:00:00Z"));
    return row;
  }

  private static SaasPrincipal samplePrincipal() {
    return new SaasPrincipal(
        UUID.randomUUID(),
        UUID.randomUUID(),
        null,
        "admin@test.local",
        List.of("PLATFORM_ADMIN"),
        List.of("admin:audit:export"),
        "test-jti",
        Instant.now().plusSeconds(3600));
  }
}
