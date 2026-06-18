package com.yunyan.saasapi.application.scim;

import com.yunyan.saasapi.domain.TenantScimSyncConfigRepository;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import com.yunyan.saasapi.domain.entity.TenantScimSyncConfig;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScimConflictResolutionService {

  private final TenantScimSyncConfigRepository syncConfigRepository;

  public ScimConflictResolutionStrategy strategyForTenant(UUID tenantId) {
    return syncConfigRepository
        .findByTenantId(tenantId)
        .map(cfg -> ScimConflictResolutionStrategy.fromDb(cfg.getConflictStrategy()))
        .orElse(ScimConflictResolutionStrategy.LAST_WRITE_WINS);
  }

  public boolean shouldApplyIncoming(ScimSyncEvent event, Instant localUpdatedAt) {
    var strategy = strategyForTenant(event.getTenantId());
    if (strategy == ScimConflictResolutionStrategy.IDP_WINS) {
      return true;
    }
    if (localUpdatedAt == null) {
      return true;
    }
    return event.getCreatedAt() != null && event.getCreatedAt().isAfter(localUpdatedAt);
  }

  public void setStrategy(UUID tenantId, ScimConflictResolutionStrategy strategy) {
    var config = new TenantScimSyncConfig();
    config.setTenantId(tenantId);
    config.setConflictStrategy(strategy.toDbValue());
    config.setUpdatedAt(Instant.now());
    syncConfigRepository.upsert(config);
  }
}
