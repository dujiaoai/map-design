package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogWebhookDeliveryJobTest {

  @Mock private SaasAppProperties saasAppProperties;

  @InjectMocks private AuditLogWebhookDeliveryJob job;

  @Test
  void deliverPendingAuditEvents_skipsWhenDisabled() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(false);
    when(saasAppProperties.getAudit()).thenReturn(audit);

    job.deliverPendingAuditEvents();

    verify(saasAppProperties).getAudit();
  }

  @Test
  void deliverPendingAuditEvents_runsWhenConfigured() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setWebhookFormat("jsonl");
    when(saasAppProperties.getAudit()).thenReturn(audit);

    job.deliverPendingAuditEvents();

    verify(saasAppProperties).getAudit();
  }
}
