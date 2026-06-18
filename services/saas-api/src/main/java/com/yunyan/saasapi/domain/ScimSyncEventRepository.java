package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ScimSyncEvent;
import com.yunyan.saasapi.domain.mapper.ScimSyncEventMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimSyncEventRepository {

  public static final String STATUS_PENDING = "pending";
  public static final String STATUS_RESOLVED = "resolved";

  private final ScimSyncEventMapper mapper;

  public void insert(ScimSyncEvent event) {
    mapper.insert(event);
  }

  public void update(ScimSyncEvent event) {
    mapper.updateById(event);
  }

  public Optional<ScimSyncEvent> findById(UUID id) {
    return Optional.ofNullable(mapper.selectById(id));
  }

  public List<ScimSyncEvent> listPending(int limit) {
    return mapper.selectList(
        new LambdaQueryWrapper<ScimSyncEvent>()
            .eq(ScimSyncEvent::getStatus, STATUS_PENDING)
            .orderByAsc(ScimSyncEvent::getCreatedAt)
            .last("LIMIT " + limit));
  }

  public long countPendingByTenantId(UUID tenantId) {
    return mapper.selectCount(
        new LambdaQueryWrapper<ScimSyncEvent>()
            .eq(ScimSyncEvent::getTenantId, tenantId)
            .eq(ScimSyncEvent::getStatus, STATUS_PENDING));
  }

  public long countPendingAll() {
    return mapper.selectCount(
        new LambdaQueryWrapper<ScimSyncEvent>().eq(ScimSyncEvent::getStatus, STATUS_PENDING));
  }
}
