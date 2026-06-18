package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuRepository;
import com.yunyan.saasapi.domain.WorkspaceMenuTenantOverrideRepository;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuTenantOverride;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantMenuOverrideListResponse;
import com.yunyan.saasapi.web.dto.admin.PutTenantMenuOverrideRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantMenuOverrideAdminService {

  private final TenantRepository tenantRepository;
  private final WorkspaceMenuRepository workspaceMenuRepository;
  private final WorkspaceMenuTenantOverrideRepository overrideRepository;
  private final AdminAuditLogService adminAuditLogService;

  public AdminTenantMenuOverrideListResponse listOverrides(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var overrides = overrideRepository.findByTenantId(tenantId).stream().map(this::toDto).toList();
    return new AdminTenantMenuOverrideListResponse(overrides);
  }

  @Transactional
  public AdminTenantMenuOverrideDto upsertOverride(
      SaasPrincipal principal, UUID tenantId, PutTenantMenuOverrideRequest request) {
    ensureTenantExists(tenantId);
    var itemId = request.itemId().trim();
    if (!workspaceMenuRepository.itemExists(itemId)) {
      throw AuthException.badRequest("Menu item not found: " + itemId);
    }
    var row =
        overrideRepository
            .findByTenantIdAndItemId(tenantId, itemId)
            .orElseGet(
                () -> {
                  var created = new WorkspaceMenuTenantOverride();
                  created.setId(UUID.randomUUID());
                  created.setTenantId(tenantId);
                  created.setItemId(itemId);
                  created.setCreatedAt(Instant.now());
                  return created;
                });
    if (request.enabled() != null) {
      row.setEnabled(request.enabled());
    }
    if (request.sortOrder() != null) {
      row.setSortOrder(request.sortOrder());
    }
    if (request.title() != null) {
      row.setTitle(StringUtils.hasText(request.title()) ? request.title().trim() : null);
    }
    if (overrideRepository.findByTenantIdAndItemId(tenantId, itemId).isEmpty()) {
      overrideRepository.insert(row);
    } else {
      overrideRepository.update(row);
    }
    adminAuditLogService.recordTenantAction(
        principal, "tenant.menu_override.upsert", tenantId, "itemId=" + itemId);
    return toDto(row);
  }

  @Transactional
  public void deleteOverride(SaasPrincipal principal, UUID tenantId, String itemId) {
    ensureTenantExists(tenantId);
    var normalized = itemId.trim();
    var existing = overrideRepository.findByTenantIdAndItemId(tenantId, normalized);
    if (existing.isEmpty()) {
      throw AuthException.notFound("Menu override not found");
    }
    overrideRepository.deleteByTenantIdAndItemId(tenantId, normalized);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.menu_override.delete", tenantId, "itemId=" + normalized);
  }

  private void ensureTenantExists(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
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
