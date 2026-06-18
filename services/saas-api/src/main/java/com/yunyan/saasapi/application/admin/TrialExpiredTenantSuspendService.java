package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TrialExpiredTenantSuspendService {

  private static final String STATUS_SUSPENDED = "suspended";

  private final TenantRepository tenantRepository;
  private final TenantSessionRevocationService tenantSessionRevocationService;

  @Transactional
  public boolean suspendDueToTrialExpiry(UUID tenantId, Instant now) {
    var tenant = tenantRepository.findById(tenantId).orElse(null);
    if (tenant == null) {
      return false;
    }
    if (STATUS_SUSPENDED.equals(tenant.getStatus())) {
      return false;
    }
    if (tenant.getTrialEndsAt() == null || tenant.getTrialEndsAt().isAfter(now)) {
      return false;
    }
    tenant.setStatus(STATUS_SUSPENDED);
    tenantRepository.update(tenant);
    tenantSessionRevocationService.revokeAllMemberSessions(tenantId);
    return true;
  }
}
