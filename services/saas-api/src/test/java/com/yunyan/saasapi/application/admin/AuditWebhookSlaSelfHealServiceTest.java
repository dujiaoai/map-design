package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

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
class AuditWebhookSlaSelfHealServiceTest {

  @Mock private AuditWebhookTargetRepository targetRepository;
  @Mock private AuditWebhookHttpClient httpClient;
  @Mock private com.yunyan.saasapi.config.SaasAppProperties saasAppProperties;

  @InjectMocks private AuditWebhookSlaSelfHealService service;

  @Test
  void countDegradedTargets_countsDisabled() {
    var target = new AuditWebhookTarget();
    target.setId(UUID.randomUUID());
    target.setEnabled(false);
    when(targetRepository.findAllOrdered()).thenReturn(List.of(target));
    assertThat(service.countDegradedTargets()).isEqualTo(1L);
  }
}
