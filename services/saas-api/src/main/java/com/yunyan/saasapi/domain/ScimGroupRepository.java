package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.ScimGroup;
import com.yunyan.saasapi.domain.mapper.ScimGroupMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimGroupRepository {

  private final ScimGroupMapper mapper;

  public List<ScimGroup> listByTenantId(UUID tenantId) {
    return mapper.selectList(Wrappers.<ScimGroup>lambdaQuery().eq(ScimGroup::getTenantId, tenantId));
  }

  public Optional<ScimGroup> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public Optional<ScimGroup> findByTenantAndExternalId(UUID tenantId, String externalId) {
    return Optional.ofNullable(
        mapper.selectOne(
            Wrappers.<ScimGroup>lambdaQuery()
                .eq(ScimGroup::getTenantId, tenantId)
                .eq(ScimGroup::getExternalId, externalId)));
  }

  public void insert(ScimGroup row) {
    mapper.insert(row);
  }

  public void update(ScimGroup row) {
    mapper.updateById(row);
  }

  public void delete(UUID id) {
    mapper.deleteById(id);
  }
}
