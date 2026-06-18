package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ScimOutboundChangeRepository;
import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.ScimChangePreviewItemDto;
import com.yunyan.saasapi.web.dto.admin.ScimChangePreviewResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScimChangePreviewService {

  private static final int PREVIEW_LIMIT = 50;

  private final TenantRepository tenantRepository;
  private final ScimSyncEventRepository syncEventRepository;
  private final ScimOutboundChangeRepository outboundChangeRepository;

  public ScimChangePreviewResponse preview(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    List<ScimChangePreviewItemDto> items = new ArrayList<>();
    for (var event : syncEventRepository.listPending(PREVIEW_LIMIT)) {
      if (!tenantId.equals(event.getTenantId())) {
        continue;
      }
      items.add(
          new ScimChangePreviewItemDto(
              "inbound",
              event.getEventType(),
              event.getExternalId(),
              event.getStatus(),
              event.getCreatedAt().toEpochMilli()));
    }
    for (var outbound : outboundChangeRepository.listPendingByTenantId(tenantId, PREVIEW_LIMIT)) {
      items.add(
          new ScimChangePreviewItemDto(
              "outbound",
              outbound.getResourceType(),
              outbound.getExternalId(),
              outbound.getOperation(),
              outbound.getCreatedAt().toEpochMilli()));
    }
    return new ScimChangePreviewResponse(
        syncEventRepository.countPendingByTenantId(tenantId),
        outboundChangeRepository.countPendingByTenantId(tenantId),
        items);
  }
}
