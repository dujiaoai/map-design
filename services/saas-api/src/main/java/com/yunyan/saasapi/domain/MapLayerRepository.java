package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.MapLayer;
import com.yunyan.saasapi.domain.mapper.MapLayerMapper;
import java.util.List;
import java.util.Optional;
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

  public Optional<MapLayer> findById(UUID id) {
    return Optional.ofNullable(mapLayerMapper.selectById(id));
  }

  public void insert(MapLayer layer) {
    mapLayerMapper.insert(layer);
  }

  public void update(MapLayer layer) {
    mapLayerMapper.updateById(layer);
  }

  public void deleteById(UUID id) {
    mapLayerMapper.deleteById(id);
  }
}
