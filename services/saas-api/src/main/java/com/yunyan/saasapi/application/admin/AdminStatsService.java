package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.web.dto.admin.AdminStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;

  public AdminStatsResponse getStats() {
    return new AdminStatsResponse(
        tenantRepository.countTenants(),
        userRepository.countUsers(),
        tenantRepository.countActiveTenants());
  }
}
