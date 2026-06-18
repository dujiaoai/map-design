package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminUsageTrendsServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private AdminAuditLogRepository adminAuditLogRepository;
  @Mock private com.yunyan.saasapi.infrastructure.billing.AdminBillingUsageClient adminBillingUsageClient;
  @Mock private com.yunyan.saasapi.infrastructure.billing.AdminBillingReconcileClient adminBillingReconcileClient;

  @InjectMocks private AdminUsageTrendsService service;

  @Test
  void getTrends_returnsSevenDayBuckets() {
    when(userRepository.countUsersCreatedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(1L);
    when(adminAuditLogRepository.countCreatedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(2L);
    when(userRepository.countActiveTenantsBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(3L);
    when(adminBillingUsageClient.countConfirmedEvents(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(4L);
    when(adminBillingReconcileClient.countReconcileDiffs(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(1L);

    var response = service.getTrends();

    assertThat(response.days()).hasSize(7);
    assertThat(response.days().getFirst().newUsers()).isEqualTo(1L);
    assertThat(response.days().getFirst().auditEvents()).isEqualTo(2L);
    assertThat(response.days().getFirst().activeTenants()).isEqualTo(3L);
    assertThat(response.days().getFirst().billingApiCallsPerDay()).isEqualTo(4L);
    assertThat(response.days().getFirst().billingReconcileDiffsPerDay()).isEqualTo(1L);
  }

  @Test
  void exportCsv_includesHeaderAndRows() {
    when(userRepository.countUsersCreatedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(0L);
    when(adminAuditLogRepository.countCreatedBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(0L);
    when(userRepository.countActiveTenantsBetween(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(0L);
    when(adminBillingUsageClient.countConfirmedEvents(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(0L);
    when(adminBillingReconcileClient.countReconcileDiffs(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
        .thenReturn(0L);

    var csv = new String(service.exportCsv());

    assertThat(csv).contains("billingReconcileDiffsPerDay");
    assertThat(csv.lines().count()).isGreaterThan(1);
  }
}
