package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.TenantScimSyncConfig;
import com.yunyan.saasapi.domain.mapper.TenantScimSyncConfigMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantScimSyncConfigRepository {

  private final TenantScimSyncConfigMapper mapper;

  public Optional<TenantScimSyncConfig> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }

  public void upsert(TenantScimSyncConfig config) {
    if (mapper.selectById(config.getTenantId()) == null) {
      mapper.insert(config);
    } else {
      mapper.updateById(config);
    }
  }
}
