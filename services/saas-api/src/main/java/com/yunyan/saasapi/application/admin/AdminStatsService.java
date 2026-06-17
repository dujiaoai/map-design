package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.web.dto.admin.AdminStatsResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminStatsService {

  private static final int RECENT_ACTIVITY_DAYS = 7;

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;

  public AdminStatsResponse getStats() {
    var since = Instant.now().minus(RECENT_ACTIVITY_DAYS, ChronoUnit.DAYS);
    return new AdminStatsResponse(
        tenantRepository.countTenants(),
        userRepository.countUsers(),
        tenantRepository.countActiveTenants(),
        userRepository.countTenantsWithLoginSince(since),
        userRepository.countUsersCreatedSince(since));
  }
}
