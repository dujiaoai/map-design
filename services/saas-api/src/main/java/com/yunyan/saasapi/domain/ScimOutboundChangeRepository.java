package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.ScimOutboundChange;
import com.yunyan.saasapi.domain.mapper.ScimOutboundChangeMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScimOutboundChangeRepository {

  public static final String STATUS_PENDING = "pending";
  public static final String STATUS_DELIVERED = "delivered";
  public static final String STATUS_FAILED = "failed";

  private final ScimOutboundChangeMapper mapper;

  public void insert(ScimOutboundChange row) {
    mapper.insert(row);
  }

  public void update(ScimOutboundChange row) {
    mapper.updateById(row);
  }

  public List<ScimOutboundChange> listPendingByTenantId(UUID tenantId, int limit) {
    return mapper.selectList(
        new LambdaQueryWrapper<ScimOutboundChange>()
            .eq(ScimOutboundChange::getTenantId, tenantId)
            .eq(ScimOutboundChange::getStatus, STATUS_PENDING)
            .orderByAsc(ScimOutboundChange::getCreatedAt)
            .last("LIMIT " + limit));
  }

  public long countPendingByTenantId(UUID tenantId) {
    return mapper.selectCount(
        new LambdaQueryWrapper<ScimOutboundChange>()
            .eq(ScimOutboundChange::getTenantId, tenantId)
            .eq(ScimOutboundChange::getStatus, STATUS_PENDING));
  }
}
