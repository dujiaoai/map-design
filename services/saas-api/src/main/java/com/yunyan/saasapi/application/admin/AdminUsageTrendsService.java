package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.infrastructure.billing.AdminBillingUsageClient;
import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import com.yunyan.saasapi.web.dto.admin.AdminUsageTrendsResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUsageTrendsService {

  private static final int TREND_DAYS = 7;

  private final UserRepository userRepository;
  private final AdminAuditLogRepository adminAuditLogRepository;
  private final AdminBillingUsageClient adminBillingUsageClient;

  public AdminUsageTrendsResponse getTrends() {
    var today = LocalDate.now(ZoneOffset.UTC);
    List<AdminUsageDayBucket> days = new ArrayList<>(TREND_DAYS);
    for (var offset = TREND_DAYS - 1; offset >= 0; offset--) {
      var day = today.minusDays(offset);
      var from = day.atStartOfDay().toInstant(ZoneOffset.UTC);
      var to = day.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
      days.add(
          new AdminUsageDayBucket(
              day.toString(),
              userRepository.countUsersCreatedBetween(from, to),
              adminAuditLogRepository.countCreatedBetween(from, to),
              userRepository.countActiveTenantsBetween(from, to),
              adminBillingUsageClient.countConfirmedEvents(from, to)));
    }
    return new AdminUsageTrendsResponse(days);
  }
}
