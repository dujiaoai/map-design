package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpRegistration;
import com.yunyan.saasapi.domain.mapper.TenantSamlIdpRegistrationMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantSamlIdpRegistrationRepository {

  private final TenantSamlIdpRegistrationMapper mapper;

  public Optional<TenantSamlIdpRegistration> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public Optional<TenantSamlIdpRegistration> findByTokenHash(String tokenHash) {
    return Optional.ofNullable(
        mapper.selectOne(
            new LambdaQueryWrapper<TenantSamlIdpRegistration>()
                .eq(TenantSamlIdpRegistration::getRegistrationTokenHash, tokenHash)));
  }

  public List<TenantSamlIdpRegistration> findPendingByTenantId(UUID tenantId) {
    return mapper.selectList(
        new LambdaQueryWrapper<TenantSamlIdpRegistration>()
            .eq(TenantSamlIdpRegistration::getTenantId, tenantId)
            .eq(TenantSamlIdpRegistration::getStatus, "pending")
            .orderByDesc(TenantSamlIdpRegistration::getCreatedAt));
  }

  public void insert(TenantSamlIdpRegistration row) {
    mapper.insert(row);
  }

  public void update(TenantSamlIdpRegistration row) {
    mapper.updateById(row);
  }
}
