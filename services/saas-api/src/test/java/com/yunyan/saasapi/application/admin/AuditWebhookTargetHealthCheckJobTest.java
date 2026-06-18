package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuditWebhookTargetHealthCheckJobTest {

  @Mock private AuditWebhookTargetHealthCheckService healthCheckService;

  @InjectMocks private AuditWebhookTargetHealthCheckJob job;

  @Test
  void checkTargets_delegatesToService() {
    job.checkTargets();
    verify(healthCheckService).checkAllEnabled();
  }

  @Test
  void checkTarget_disablesAfterThreshold() {
    var props = new SaasAppProperties();
    props.getAudit().setWebhookHealthFailureThreshold(2);
    var repo = mock(AuditWebhookTargetRepository.class);
    var http = mock(AuditWebhookHttpClient.class);
    var service = new AuditWebhookTargetHealthCheckService(repo, http, props);
    var target = new AuditWebhookTarget();
    target.setId(UUID.randomUUID());
    target.setUrl("https://siem.example/hook");
    target.setEnabled(true);
    target.setConsecutiveFailures(1);
    when(http.pingTarget(target.getUrl())).thenReturn(false);

    service.checkTarget(target);

    assertThat(target.getEnabled()).isFalse();
    assertThat(target.getConsecutiveFailures()).isEqualTo(2);
  }
}
