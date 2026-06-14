package com.yunyan.saasapi.application.billing;

import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.tenant.TenantKind;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SignupBonusOrchestrator {

  private static final String TENANT_ADMIN = "TENANT_ADMIN";

  private final BillingClient billingClient;
  private final TenantRepository tenantRepository;

  public void tryGrantSignupBonus(AuthenticatedUser user) {
    var tenant = tenantRepository.findById(user.tenantId()).orElse(null);
    if (tenant == null) {
      return;
    }

    var tenantKind =
        tenant.getTenantKind() != null ? tenant.getTenantKind() : TenantKind.ORGANIZATION;

    if (TenantKind.ORGANIZATION.equals(tenantKind) && !hasRole(user.roleCodes(), TENANT_ADMIN)) {
      return;
    }

    billingClient.grantSignupBonus(
        new SignupBonusRequest(user.tenantId(), user.id(), tenantKind));
  }

  private static boolean hasRole(List<String> roleCodes, String role) {
    return roleCodes != null && roleCodes.contains(role);
  }
}
