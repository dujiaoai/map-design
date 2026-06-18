package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreateAuditWebhookTargetRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminAuditWebhookTargetServiceTest {

  @Mock private AuditWebhookTargetRepository targetRepository;
  @Mock private AdminAuditLogService adminAuditLogService;
  @Mock private com.yunyan.saasapi.config.SaasAppProperties saasAppProperties;

  @InjectMocks private AdminAuditWebhookTargetService service;

  @Test
  void createTarget_persistsRow() {
    when(saasAppProperties.getAudit()).thenReturn(new com.yunyan.saasapi.config.SaasAppProperties.Audit());

    var dto =
        service.createTarget(
            principal(),
            new CreateAuditWebhookTargetRequest("https://siem.example/hook", "jsonl", true, 1));

    assertThat(dto.url()).isEqualTo("https://siem.example/hook");
    verify(targetRepository).insert(org.mockito.ArgumentMatchers.any(AuditWebhookTarget.class));
  }

  private static SaasPrincipal principal() {
    return new SaasPrincipal(
        UUID.randomUUID(), UUID.randomUUID(), null, "admin@test", List.of(), List.of(), null, null);
  }
}
