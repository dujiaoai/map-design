package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantAdminService {

  private static final String STATUS_ACTIVE = "active";
  private static final String DEFAULT_PLAN = "free";

  private final TenantRepository tenantRepository;

  public AdminTenantListResponse listTenants(AdminListParams params) {
    var result = tenantRepository.findTenants(params);
    var tenants = result.items().stream().map(TenantAdminService::toDto).toList();
    if (params.isPaginated()) {
      return AdminTenantListResponse.paged(
          tenants, result.total(), params.resolvePage(), params.resolveSize());
    }
    return AdminTenantListResponse.unpaged(tenants);
  }

  public AdminTenantDto getTenant(UUID tenantId) {
    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return toDto(tenant);
  }

  @Transactional
  public AdminTenantDto createTenant(CreateTenantRequest request) {
    var slug = normalizeSlug(request.slug());
    if (tenantRepository.findBySlug(slug).isPresent()) {
      throw AuthException.conflict("Tenant slug already exists");
    }

    var tenant = new SysTenant();
    tenant.setId(UUID.randomUUID());
    tenant.setName(request.name().trim());
    tenant.setSlug(slug);
    tenant.setPlan(resolvePlan(request.plan()));
    tenant.setStatus(STATUS_ACTIVE);
    tenant.setCreatedAt(Instant.now());
    tenantRepository.insert(tenant);
    return toDto(tenant);
  }

  @Transactional
  public AdminTenantDto patchTenant(UUID tenantId, PatchTenantRequest request) {
    if (!hasPatchFields(request)) {
      throw AuthException.badRequest("At least one of name, plan, or status is required");
    }

    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));

    if (StringUtils.hasText(request.name())) {
      tenant.setName(request.name().trim());
    }
    if (StringUtils.hasText(request.plan())) {
      tenant.setPlan(request.plan().trim());
    }
    if (StringUtils.hasText(request.status())) {
      tenant.setStatus(request.status().trim());
    }

    tenantRepository.update(tenant);
    return toDto(tenant);
  }

  private static boolean hasPatchFields(PatchTenantRequest request) {
    return StringUtils.hasText(request.name())
        || StringUtils.hasText(request.plan())
        || StringUtils.hasText(request.status());
  }

  private static String normalizeSlug(String slug) {
    return slug.trim().toLowerCase();
  }

  private static String resolvePlan(String plan) {
    if (!StringUtils.hasText(plan)) {
      return DEFAULT_PLAN;
    }
    return plan.trim();
  }

  private static AdminTenantDto toDto(SysTenant tenant) {
    var createdAt = tenant.getCreatedAt() == null ? 0L : tenant.getCreatedAt().toEpochMilli();
    var status = tenant.getStatus() == null ? STATUS_ACTIVE : tenant.getStatus();
    return new AdminTenantDto(
        tenant.getId().toString(),
        tenant.getName(),
        tenant.getSlug(),
        tenant.getPlan(),
        status,
        createdAt);
  }
}
