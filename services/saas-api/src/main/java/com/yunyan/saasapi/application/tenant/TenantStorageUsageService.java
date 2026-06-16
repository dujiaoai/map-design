package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.domain.MapLayerRepository;
import com.yunyan.saasapi.domain.tenant.TenantStorageUsageCatalog;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantStorageUsageService {

  private final MapLayerRepository mapLayerRepository;

  public long countUsedBytes(UUID tenantId) {
    return mapLayerRepository.countByTenantId(tenantId) * TenantStorageUsageCatalog.BYTES_PER_LAYER;
  }
}
