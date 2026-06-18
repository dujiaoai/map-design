package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookCursorRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminAuditWebhookServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private AdminAuditWebhookCursorRepository cursorRepository;
  @Mock private AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock private AdminAuditLogRepository adminAuditLogRepository;

  @InjectMocks private AdminAuditWebhookService service;

  @Test
  void getConfig_signatureEnabledWhenSecretConfigured() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setWebhookSigningSecret("secret");
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(cursorRepository.findDefault()).thenReturn(java.util.Optional.empty());
    when(adminAuditLogRepository.countUndeliveredAfter(null)).thenReturn(3L);
    when(deadLetterRepository.countAll()).thenReturn(0L);

    var config = service.getConfig();

    assertThat(config.signatureEnabled()).isTrue();
    assertThat(config.deliveryMode()).isEqualTo("webhook");
    assertThat(config.pendingEstimate()).isEqualTo(3L);
  }
}
