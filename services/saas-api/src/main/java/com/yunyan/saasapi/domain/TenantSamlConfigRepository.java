package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.domain.mapper.TenantSamlConfigMapper;
import java.util.List;
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

  public List<TenantSamlConfig> listMetadataSyncEnabled() {
    return mapper.selectList(
        new LambdaQueryWrapper<TenantSamlConfig>()
            .eq(TenantSamlConfig::getMetadataSyncEnabled, true)
            .isNotNull(TenantSamlConfig::getMetadataUrl)
            .ne(TenantSamlConfig::getMetadataUrl, ""));
  }

  public List<TenantSamlConfig> listAll() {
    return mapper.selectList(new LambdaQueryWrapper<>());
  }
}
