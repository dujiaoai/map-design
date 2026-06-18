package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantDataExportCollector {

  private final TenantRepository tenantRepository;

  public Map<String, Object> collect(UUID tenantId, TenantDataExportRequest request) {
    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    var payload = new LinkedHashMap<String, Object>();
    payload.put("exportRequestId", request.getId().toString());
    payload.put("tenantId", tenant.getId().toString());
    payload.put("tenantName", tenant.getName());
    payload.put("tenantSlug", tenant.getSlug());
    payload.put("plan", tenant.getPlan());
    payload.put("status", tenant.getStatus());
    payload.put("featureCodes", tenantRepository.findFeatureCodes(tenantId));
    payload.put("generatedAt", java.time.Instant.now().toString());
    payload.put("note", "Phase 8 skeleton export package; extend with members/audit payloads.");
    return payload;
  }
}
