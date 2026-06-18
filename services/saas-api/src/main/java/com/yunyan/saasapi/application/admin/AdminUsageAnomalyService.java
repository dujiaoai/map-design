package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.infrastructure.billing.AdminBillingUsageClient;
import com.yunyan.saasapi.web.dto.admin.AdminUsageAnomaliesResponse;
import com.yunyan.saasapi.web.dto.admin.AdminUsageAnomalyDto;
import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUsageAnomalyService {

  private static final int TREND_DAYS = 7;
  private static final double SPIKE_RATIO_THRESHOLD = 2.0;

  private final UserRepository userRepository;
  private final AdminAuditLogRepository adminAuditLogRepository;
  private final AdminBillingUsageClient adminBillingUsageClient;

  public AdminUsageAnomaliesResponse detectAnomalies() {
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
              adminBillingUsageClient.countConfirmedEvents(from, to),
              0));
    }
    var todayBucket = days.get(days.size() - 1);
    var prior = days.subList(0, days.size() - 1);
    List<AdminUsageAnomalyDto> anomalies = new ArrayList<>();
    checkSpike(anomalies, "newUsers", todayBucket.newUsers(), prior.stream().mapToLong(AdminUsageDayBucket::newUsers).average().orElse(0), todayBucket.date());
    checkSpike(anomalies, "auditEvents", todayBucket.auditEvents(), prior.stream().mapToLong(AdminUsageDayBucket::auditEvents).average().orElse(0), todayBucket.date());
    checkSpike(anomalies, "billingApiCalls", todayBucket.billingApiCallsPerDay(), prior.stream().mapToLong(AdminUsageDayBucket::billingApiCallsPerDay).average().orElse(0), todayBucket.date());
    return new AdminUsageAnomaliesResponse(anomalies);
  }

  private static void checkSpike(
      List<AdminUsageAnomalyDto> anomalies,
      String metric,
      long current,
      double avg,
      String day) {
    if (avg <= 0 || current <= 0) {
      return;
    }
    var ratio = current / avg;
    if (ratio > SPIKE_RATIO_THRESHOLD) {
      anomalies.add(new AdminUsageAnomalyDto(metric, current, avg, ratio, day));
    }
  }
}
