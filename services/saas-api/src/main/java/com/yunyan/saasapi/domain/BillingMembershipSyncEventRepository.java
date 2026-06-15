package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.BillingMembershipSyncEvent;
import com.yunyan.saasapi.domain.mapper.BillingMembershipSyncEventMapper;
import com.yunyan.saasapi.security.TenantRlsBypass;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BillingMembershipSyncEventRepository {

  private final BillingMembershipSyncEventMapper mapper;

  public void insert(BillingMembershipSyncEvent row) {
    TenantRlsBypass.run(() -> mapper.insert(row));
  }

  public List<BillingMembershipSyncEvent> findPending(int limit) {
    return TenantRlsBypass.call(() -> mapper.findPending(limit));
  }

  public int markProcessed(UUID id, Instant processedAt, String processedBy) {
    return TenantRlsBypass.call(() -> mapper.markProcessed(id, processedAt, processedBy));
  }
}
