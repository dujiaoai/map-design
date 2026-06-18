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
class AuditWebhookRegionalRouterTest {

  @Mock private AuditWebhookTargetRepository targetRepository;

  @InjectMocks private AuditWebhookRegionalRouter router;

  @Test
  void resolveTargetsForRegion_matchesRegionTag() {
    var target = new AuditWebhookTarget();
    target.setId(UUID.randomUUID());
    target.setRegion("eu-west-1");
    target.setEnabled(true);
    when(targetRepository.findEnabledOrdered()).thenReturn(List.of(target));

    var matched = router.resolveTargetsForRegion("eu-west-1");

    assertThat(matched).hasSize(1);
  }
}
