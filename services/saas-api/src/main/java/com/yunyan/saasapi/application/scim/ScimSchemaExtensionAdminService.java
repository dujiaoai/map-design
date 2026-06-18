package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.ScimSchemaExtensionRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminScimSchemaExtensionResponse;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScimSchemaExtensionAdminService {

  private final TenantRepository tenantRepository;
  private final ScimSchemaExtensionRepository extensionRepository;

  public AdminScimSchemaExtensionResponse getSummary(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var row = extensionRepository.findByTenantId(tenantId);
    var json = row.map(r -> r.getAttributesJson()).orElse("[]");
    return new AdminScimSchemaExtensionResponse(
        tenantId.toString(),
        json,
        List.of("department", "manager"),
        row.isPresent());
  }
}
