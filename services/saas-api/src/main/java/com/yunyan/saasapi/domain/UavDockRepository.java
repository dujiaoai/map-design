package com.yunyan.saasapi.domain;

import com.yunyan.saasapi.domain.entity.UavDock;
import com.yunyan.saasapi.domain.mapper.UavDockMapper;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class UavDockRepository {

  private final UavDockMapper uavDockMapper;

  public List<UavDock> findByTenantId(UUID tenantId) {
    return uavDockMapper.selectByTenantId(tenantId);
  }

  public Optional<UavDock> findById(UUID id) {
    return Optional.ofNullable(uavDockMapper.selectById(id));
  }
}
