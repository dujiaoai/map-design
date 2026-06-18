package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpFederation;
import com.yunyan.saasapi.domain.mapper.TenantSamlIdpFederationMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantSamlIdpFederationRepository {

  private final TenantSamlIdpFederationMapper mapper;

  public Optional<TenantSamlIdpFederation> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public List<TenantSamlIdpFederation> listByTenantId(UUID tenantId) {
    return mapper.selectList(
        new LambdaQueryWrapper<TenantSamlIdpFederation>()
            .eq(TenantSamlIdpFederation::getTenantId, tenantId)
            .orderByAsc(TenantSamlIdpFederation::getPriority));
  }

  public List<TenantSamlIdpFederation> listEnabledByTenantIdOrdered(UUID tenantId) {
    return mapper.selectList(
        new LambdaQueryWrapper<TenantSamlIdpFederation>()
            .eq(TenantSamlIdpFederation::getTenantId, tenantId)
            .eq(TenantSamlIdpFederation::getEnabled, true)
            .orderByAsc(TenantSamlIdpFederation::getPriority));
  }

  public void insert(TenantSamlIdpFederation row) {
    mapper.insert(row);
  }

  public void deleteById(UUID id) {
    mapper.deleteById(id);
  }
}
