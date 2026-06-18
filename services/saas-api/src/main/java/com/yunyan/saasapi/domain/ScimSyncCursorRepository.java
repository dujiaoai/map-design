package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.ScimSyncCursor;
import com.yunyan.saasapi.domain.mapper.ScimSyncCursorMapper;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimSyncCursorRepository {

  private final ScimSyncCursorMapper mapper;

  public Optional<ScimSyncCursor> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }

  public void upsert(UUID tenantId, Instant lastSyncAt) {
    var row = new ScimSyncCursor();
    row.setTenantId(tenantId);
    row.setLastSyncAt(lastSyncAt);
    if (mapper.selectById(tenantId) == null) {
      mapper.insert(row);
    } else {
      mapper.updateById(row);
    }
  }
}
