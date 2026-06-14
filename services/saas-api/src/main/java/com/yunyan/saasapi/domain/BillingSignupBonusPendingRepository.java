package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.BillingSignupBonusPending;
import com.yunyan.saasapi.domain.mapper.BillingSignupBonusPendingMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BillingSignupBonusPendingRepository {

  private final BillingSignupBonusPendingMapper mapper;

  public void upsert(UUID tenantId, UUID userId, String tenantKind, String lastError) {
    TenantRlsBypass.run(
        () -> {
          var now = Instant.now();
          var existing = mapper.findByTenantAndUser(tenantId, userId);
          if (existing != null) {
            existing.setTenantKind(tenantKind);
            existing.setLastError(lastError);
            existing.setUpdatedAt(now);
            mapper.updateByTenantAndUser(existing);
            return;
          }
          var row = new BillingSignupBonusPending();
          row.setId(UUID.randomUUID());
          row.setTenantId(tenantId);
          row.setUserId(userId);
          row.setTenantKind(tenantKind);
          row.setLastError(lastError);
          row.setCreatedAt(now);
          row.setUpdatedAt(now);
          mapper.insert(row);
        });
  }

  public List<BillingSignupBonusPending> findRetryable(int maxAttempts, int limit) {
    return TenantRlsBypass.call(() -> mapper.findRetryable(maxAttempts, limit));
  }

  public void recordFailure(UUID id, String lastError) {
    TenantRlsBypass.run(() -> mapper.recordFailure(id, lastError, Instant.now()));
  }

  public void delete(UUID tenantId, UUID userId) {
    TenantRlsBypass.run(() -> mapper.deleteByTenantAndUser(tenantId, userId));
  }
}
