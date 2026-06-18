package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.ScimUserExternalId;
import com.yunyan.saasapi.domain.mapper.ScimUserExternalIdMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimUserExternalIdRepository {

  private final ScimUserExternalIdMapper mapper;

  public List<ScimUserExternalId> listByTenantId(UUID tenantId) {
    return mapper.selectList(
        Wrappers.<ScimUserExternalId>lambdaQuery().eq(ScimUserExternalId::getTenantId, tenantId));
  }

  public Optional<ScimUserExternalId> findByTenantAndExternalId(UUID tenantId, String externalId) {
    return Optional.ofNullable(
        mapper.selectOne(
            Wrappers.<ScimUserExternalId>lambdaQuery()
                .eq(ScimUserExternalId::getTenantId, tenantId)
                .eq(ScimUserExternalId::getExternalId, externalId)));
  }

  public Optional<ScimUserExternalId> findByTenantAndUserId(UUID tenantId, UUID userId) {
    return Optional.ofNullable(
        mapper.selectOne(
            Wrappers.<ScimUserExternalId>lambdaQuery()
                .eq(ScimUserExternalId::getTenantId, tenantId)
                .eq(ScimUserExternalId::getUserId, userId)));
  }

  public void insert(ScimUserExternalId row) {
    mapper.insert(row);
  }

  public void update(ScimUserExternalId row) {
    mapper.update(
        row,
        Wrappers.<ScimUserExternalId>lambdaUpdate()
            .eq(ScimUserExternalId::getTenantId, row.getTenantId())
            .eq(ScimUserExternalId::getExternalId, row.getExternalId()));
  }

  public void delete(UUID tenantId, String externalId) {
    mapper.delete(
        Wrappers.<ScimUserExternalId>lambdaQuery()
            .eq(ScimUserExternalId::getTenantId, tenantId)
            .eq(ScimUserExternalId::getExternalId, externalId));
  }
}
