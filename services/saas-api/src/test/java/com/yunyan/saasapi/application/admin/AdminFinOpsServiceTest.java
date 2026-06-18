package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import com.yunyan.saasapi.web.dto.admin.AdminUsageTrendsResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminFinOpsServiceTest {

  @Mock private AdminUsageTrendsService usageTrendsService;
  @Mock private TenantRepository tenantRepository;
  @Mock private SaasAppProperties saasAppProperties;

  @InjectMocks private AdminFinOpsService service;

  @Test
  void attributeCosts_returnsPositiveTotal() {
    when(usageTrendsService.getTrends())
        .thenReturn(
            new AdminUsageTrendsResponse(
                List.of(new AdminUsageDayBucket("2026-06-01", 1, 2, 3, 10000, 0))));
    when(saasAppProperties.getFinOps()).thenReturn(new SaasAppProperties.FinOps());
    when(tenantRepository.findAllTenants()).thenReturn(List.of());
    var result = service.attributeCosts();
    assertThat(result.totalEstimatedMonthlyCostUsd()).isGreaterThan(0);
  }
}
