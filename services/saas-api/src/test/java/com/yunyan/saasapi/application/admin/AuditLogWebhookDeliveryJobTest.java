package com.yunyan.saasapi.application.admin;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditLogWebhookDeliveryJobTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private AuditWebhookHttpClient auditWebhookHttpClient;

  @InjectMocks private AuditLogWebhookDeliveryJob job;

  @Test
  void deliverPendingAuditEvents_skipsWhenDisabled() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(false);
    when(saasAppProperties.getAudit()).thenReturn(audit);

    job.deliverPendingAuditEvents();
  }

  @Test
  void deliverPendingAuditEvents_postsWhenConfigured() {
    var audit = new SaasAppProperties.Audit();
    audit.setWebhookEnabled(true);
    audit.setWebhookUrl("https://siem.example/hook");
    audit.setWebhookFormat("jsonl");
    when(saasAppProperties.getAudit()).thenReturn(audit);
    when(auditWebhookHttpClient.postJson(audit.getWebhookUrl(), org.mockito.ArgumentMatchers.anyString()))
        .thenReturn(true);

    job.deliverPendingAuditEvents();

    verify(auditWebhookHttpClient).postJson(org.mockito.ArgumentMatchers.eq(audit.getWebhookUrl()), org.mockito.ArgumentMatchers.anyString());
  }
}
