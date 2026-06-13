package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.MapLayer;
import com.yunyan.saasapi.domain.mapper.MapLayerMapper;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MapLayerRepository {

  private final MapLayerMapper mapLayerMapper;

  public List<MapLayer> findByTenantId(UUID tenantId) {
    return mapLayerMapper.selectByTenantId(tenantId);
  }
}
