package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.scim.ScimConflictResolutionService;
import com.yunyan.saasapi.domain.ScimSyncEventRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.ScimSyncEventSummaryResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScimSyncEventAdminService {

  private final TenantRepository tenantRepository;
  private final ScimSyncEventRepository syncEventRepository;
  private final ScimConflictResolutionService conflictResolutionService;

  public ScimSyncEventSummaryResponse summary(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var tenantPending = syncEventRepository.countPendingByTenantId(tenantId);
    var strategy = conflictResolutionService.strategyForTenant(tenantId);
    return new ScimSyncEventSummaryResponse(
        syncEventRepository.countPendingAll(), tenantPending, strategy.toDbValue());
  }
}
