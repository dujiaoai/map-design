package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.domain.mapper.TenantSamlConfigMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantSamlConfigRepository {

  private final TenantSamlConfigMapper mapper;

  public Optional<TenantSamlConfig> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }

  public void insert(TenantSamlConfig config) {
    mapper.insert(config);
  }

  public void update(TenantSamlConfig config) {
    mapper.updateById(config);
  }
}
