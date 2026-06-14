package com.yunyan.billingapi.application.tenant;

import com.yunyan.billingapi.domain.mapper.SysTenantFeatureMapper;
import com.yunyan.billingapi.domain.tenant.TenantFeatureCodes;
import com.yunyan.billingapi.security.SaasPrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class TenantRechargePolicyService {

  private static final String TENANT_ADMIN = "TENANT_ADMIN";

  private final SysTenantFeatureMapper tenantFeatureMapper;

  public TenantRechargePolicyService(SysTenantFeatureMapper tenantFeatureMapper) {
    this.tenantFeatureMapper = tenantFeatureMapper;
  }

  public boolean isSelfRechargeAllowed(SaasPrincipal principal) {
    if (isTenantAdmin(principal)) {
      return true;
    }
    return !tenantFeatureMapper.exists(
        principal.tenantId(), TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED);
  }

  public boolean isMemberRechargeDisabled(UUID tenantId) {
    return tenantFeatureMapper.exists(tenantId, TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED);
  }

  private static boolean isTenantAdmin(SaasPrincipal principal) {
    var roles = principal.roleCodes() != null ? principal.roleCodes() : List.<String>of();
    return roles.contains(TENANT_ADMIN);
  }
}
