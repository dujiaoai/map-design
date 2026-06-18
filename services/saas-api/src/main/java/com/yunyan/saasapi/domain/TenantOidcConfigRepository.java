package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.TenantOidcConfig;
import com.yunyan.saasapi.domain.mapper.TenantOidcConfigMapper;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantOidcConfigRepository {

  private final TenantOidcConfigMapper mapper;

  public Optional<TenantOidcConfig> findByTenantId(UUID tenantId) {
    return Optional.ofNullable(mapper.selectById(tenantId));
  }

  public void insert(TenantOidcConfig config) {
    mapper.insert(config);
  }

  public void update(TenantOidcConfig config) {
    mapper.updateById(config);
  }
}
