package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuTenantOverrideRepository;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuTenantOverride;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideListResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantMenuOverrideAdminService {

  private final TenantRepository tenantRepository;
  private final WorkspaceMenuTenantOverrideRepository overrideRepository;

  public AdminTenantMenuOverrideListResponse listOverrides(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var overrides = overrideRepository.findByTenantId(tenantId).stream().map(this::toDto).toList();
    return new AdminTenantMenuOverrideListResponse(overrides);
  }

  private AdminTenantMenuOverrideDto toDto(WorkspaceMenuTenantOverride row) {
    return new AdminTenantMenuOverrideDto(
        row.getId().toString(),
        row.getTenantId().toString(),
        row.getItemId(),
        row.getEnabled(),
        row.getSortOrder(),
        row.getTitle());
  }
}
