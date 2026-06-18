package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.infrastructure.billing.AdminBillingUsageClient;
import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminUsageAnomalyServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private AdminAuditLogRepository adminAuditLogRepository;
  @Mock private AdminBillingUsageClient adminBillingUsageClient;

  @InjectMocks private AdminUsageAnomalyService service;

  @Test
  void detectAnomalies_flagsNewUsersSpike() {
    var today = LocalDate.now(ZoneOffset.UTC);
    stubDay(today.minusDays(6), 1, 1, 1);
    stubDay(today.minusDays(5), 1, 1, 1);
    stubDay(today.minusDays(4), 1, 1, 1);
    stubDay(today.minusDays(3), 1, 1, 1);
    stubDay(today.minusDays(2), 1, 1, 1);
    stubDay(today.minusDays(1), 1, 1, 1);
    stubDay(today, 10, 1, 1);

    var response = service.detectAnomalies();

    assertThat(response.anomalies()).anyMatch(a -> "newUsers".equals(a.metric()));
  }

  private void stubDay(LocalDate day, long newUsers, long auditEvents, long billingCalls) {
    var from = day.atStartOfDay().toInstant(ZoneOffset.UTC);
    var to = day.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
    when(userRepository.countUsersCreatedBetween(from, to)).thenReturn(newUsers);
    when(adminAuditLogRepository.countCreatedBetween(from, to)).thenReturn(auditEvents);
    when(adminBillingUsageClient.countConfirmedEvents(from, to)).thenReturn(billingCalls);
    when(userRepository.countActiveTenantsBetween(from, to)).thenReturn(1L);
  }
}
