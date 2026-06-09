package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.tenant.TenantFeaturesResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantListResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantSummaryDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final TenantRepository tenantRepository;

  public TenantListResponse listAccessible(SaasPrincipal principal) {
    requirePrincipal(principal);

    List<SysTenant> tenants;
    if (isPlatformAdmin(principal)) {
      tenants = tenantRepository.findAllTenants();
    } else {
      var email = tenantRepository
          .findActiveUserEmail(principal.userId())
          .orElseThrow(() -> AuthException.unauthorized("User not found"));
      tenants = tenantRepository.findTenantsByUserEmail(email);
    }

    var currentTenantId = principal.tenantId();
    var items = tenants.stream()
        .map(tenant -> toSummary(tenant, tenant.getId().equals(currentTenantId)))
        .toList();
    return new TenantListResponse(items);
  }

  public TenantFeaturesResponse getFeatures(SaasPrincipal principal, UUID tenantId) {
    requirePrincipal(principal);
    ensureCanAccess(principal, tenantId);
    var features = tenantRepository.findFeatureCodes(tenantId);
    return new TenantFeaturesResponse(tenantId.toString(), features);
  }

  private void ensureCanAccess(SaasPrincipal principal, UUID tenantId) {
    if (tenantRepository.findById(tenantId).isEmpty()) {
      throw AuthException.notFound("Tenant not found");
    }
    if (isPlatformAdmin(principal)) {
      return;
    }
    var email = tenantRepository
        .findActiveUserEmail(principal.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));
    var accessible = tenantRepository.findTenantsByUserEmail(email).stream()
        .anyMatch(tenant -> tenant.getId().equals(tenantId));
    if (!accessible) {
      throw AuthException.forbidden("Tenant access denied");
    }
  }

  private void requirePrincipal(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
  }

  private boolean isPlatformAdmin(SaasPrincipal principal) {
    return principal.roleCodes().contains(PLATFORM_ADMIN);
  }

  private TenantSummaryDto toSummary(SysTenant tenant, boolean current) {
    return new TenantSummaryDto(
        tenant.getId().toString(),
        tenant.getName(),
        tenant.getSlug(),
        tenant.getPlan(),
        current);
  }
}
