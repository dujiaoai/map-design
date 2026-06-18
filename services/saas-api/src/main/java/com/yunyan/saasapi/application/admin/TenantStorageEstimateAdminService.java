package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantStorageEstimateDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantStorageEstimateAdminService {

  private final TenantRepository tenantRepository;

  public AdminTenantStorageEstimateDto estimate(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    // FND-08g 骨架：后续对接对象存储/图层计量
    return new AdminTenantStorageEstimateDto(
        tenantId.toString(), 0L, 0L, 0L, "skeleton");
  }
}
