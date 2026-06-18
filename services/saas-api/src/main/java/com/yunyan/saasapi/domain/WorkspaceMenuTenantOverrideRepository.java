package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.yunyan.saasapi.domain.entity.WorkspaceMenuTenantOverride;
import com.yunyan.saasapi.domain.mapper.WorkspaceMenuTenantOverrideMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class WorkspaceMenuTenantOverrideRepository {

  private final WorkspaceMenuTenantOverrideMapper mapper;

  public List<WorkspaceMenuTenantOverride> findByTenantId(UUID tenantId) {
    return mapper.selectList(
        Wrappers.<WorkspaceMenuTenantOverride>lambdaQuery()
            .eq(WorkspaceMenuTenantOverride::getTenantId, tenantId)
            .orderByAsc(WorkspaceMenuTenantOverride::getItemId));
  }

  public Optional<WorkspaceMenuTenantOverride> findByTenantIdAndItemId(UUID tenantId, String itemId) {
    return Optional.ofNullable(
        mapper.selectOne(
            Wrappers.<WorkspaceMenuTenantOverride>lambdaQuery()
                .eq(WorkspaceMenuTenantOverride::getTenantId, tenantId)
                .eq(WorkspaceMenuTenantOverride::getItemId, itemId)));
  }

  public void insert(WorkspaceMenuTenantOverride row) {
    mapper.insert(row);
  }

  public void update(WorkspaceMenuTenantOverride row) {
    mapper.updateById(row);
  }

  public void deleteByTenantIdAndItemId(UUID tenantId, String itemId) {
    mapper.delete(
        Wrappers.<WorkspaceMenuTenantOverride>lambdaQuery()
            .eq(WorkspaceMenuTenantOverride::getTenantId, tenantId)
            .eq(WorkspaceMenuTenantOverride::getItemId, itemId));
  }
}
