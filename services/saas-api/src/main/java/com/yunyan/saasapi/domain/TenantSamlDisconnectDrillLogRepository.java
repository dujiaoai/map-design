package com.yunyan.saasapi.domain;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.yunyan.saasapi.domain.entity.TenantSamlDisconnectDrillLog;
import com.yunyan.saasapi.domain.mapper.TenantSamlDisconnectDrillLogMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class TenantSamlDisconnectDrillLogRepository {

  private final TenantSamlDisconnectDrillLogMapper mapper;

  public void insert(TenantSamlDisconnectDrillLog row) {
    mapper.insert(row);
  }

  public List<TenantSamlDisconnectDrillLog> listRecentByTenantId(UUID tenantId, int limit) {
    return mapper.selectList(
        new LambdaQueryWrapper<TenantSamlDisconnectDrillLog>()
            .eq(TenantSamlDisconnectDrillLog::getTenantId, tenantId)
            .orderByDesc(TenantSamlDisconnectDrillLog::getDrilledAt)
            .last("LIMIT " + limit));
  }
}
