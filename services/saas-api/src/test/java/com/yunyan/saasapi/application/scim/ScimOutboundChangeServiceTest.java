package com.yunyan.saasapi.application.scim;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.admin.AuditWebhookHttpClient;
import com.yunyan.saasapi.domain.ScimOutboundChangeRepository;
import com.yunyan.saasapi.domain.entity.ScimOutboundChange;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ScimOutboundChangeServiceTest {

  @Mock private ScimOutboundChangeRepository outboundChangeRepository;
  @Mock private AuditWebhookHttpClient httpClient;

  @InjectMocks private ScimOutboundChangeService service;

  @Test
  void queueChange_insertsPendingRow() {
    var tenantId = UUID.randomUUID();
    var row = service.queueChange(tenantId, "User", "ext-42", "update", "{}");
    assertThat(row.getStatus()).isEqualTo(ScimOutboundChangeRepository.STATUS_PENDING);
  }

  @Test
  void deliverToWebhook_marksDeliveredOnSuccess() {
    var change = new ScimOutboundChange();
    change.setId(UUID.randomUUID());
    change.setResourceType("User");
    change.setExternalId("ext-42");
    change.setOperation("update");
    when(httpClient.postJson(anyString(), anyString())).thenReturn(true);

    var ok = service.deliverToWebhook(change, "https://idp.example/scim-webhook");

    assertThat(ok).isTrue();
    assertThat(change.getStatus()).isEqualTo(ScimOutboundChangeRepository.STATUS_DELIVERED);
  }
}
