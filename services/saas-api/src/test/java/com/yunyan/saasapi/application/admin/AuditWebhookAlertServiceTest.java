package com.yunyan.saasapi.application.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditWebhookAlertServiceTest {

  @Mock AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  @Mock AuditWebhookHttpClient auditWebhookHttpClient;
  @Mock SaasAppProperties saasAppProperties;

  @InjectMocks AuditWebhookAlertService alertService;

  @Test
  void routeDeadLetterAlert_postsToAlertUrl() {
    var audit = new SaasAppProperties.Audit();
    audit.setAlertWebhookUrl("https://alert.example/hook");
    when(saasAppProperties.getAudit()).thenReturn(audit);

    alertService.routeDeadLetterAlert(3L, "HTTP failed");

    verify(auditWebhookHttpClient).postJson(eq("https://alert.example/hook"), any(String.class), eq(null));
  }
}
