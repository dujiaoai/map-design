package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.ScimOutboundChangeRepository;
import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import com.yunyan.saasapi.domain.entity.Tenant;
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
class ScimChangePreviewServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private ScimSyncEventRepository syncEventRepository;
  @Mock private ScimOutboundChangeRepository outboundChangeRepository;

  @InjectMocks private ScimChangePreviewService service;

  @Test
  void preview_mergesInboundAndOutbound() {
    var tenantId = UUID.randomUUID();
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new Tenant()));
    var event = new ScimSyncEvent();
    event.setTenantId(tenantId);
    event.setEventType("user.updated");
    event.setExternalId("ext-1");
    event.setStatus("pending");
    event.setCreatedAt(Instant.now());
    when(syncEventRepository.listPending(50)).thenReturn(List.of(event));
    when(syncEventRepository.countPendingByTenantId(tenantId)).thenReturn(1L);
    when(outboundChangeRepository.listPendingByTenantId(tenantId, 50)).thenReturn(List.of());
    when(outboundChangeRepository.countPendingByTenantId(tenantId)).thenReturn(0L);

    var preview = service.preview(tenantId);

    assertThat(preview.inboundPendingCount()).isEqualTo(1);
    assertThat(preview.items()).hasSize(1);
    assertThat(preview.items().get(0).direction()).isEqualTo("inbound");
  }
}
