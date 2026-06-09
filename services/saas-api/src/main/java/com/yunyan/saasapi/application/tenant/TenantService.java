package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.tenant.TenantListResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantSummaryDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final TenantRepository tenantRepository;

  public TenantListResponse listAccessible(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }

    List<SysTenant> tenants;
    if (principal.roleCodes().contains(PLATFORM_ADMIN)) {
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

  private TenantSummaryDto toSummary(SysTenant tenant, boolean current) {
    return new TenantSummaryDto(
        tenant.getId().toString(),
        tenant.getName(),
        tenant.getSlug(),
        tenant.getPlan(),
        current);
  }
}
