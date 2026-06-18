package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsCostAttributionResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminUsageBudgetAlertServiceTest {

  @Mock private AdminFinOpsService adminFinOpsService;
  @Mock private SaasAppProperties saasAppProperties;

  @InjectMocks private AdminUsageBudgetAlertService service;

  @Test
  void getBudgetStatus_alertsWhenOverThreshold() {
    var finOps = new SaasAppProperties.FinOps();
    finOps.setMonthlyBudgetUsd(1000);
    finOps.setAlertThresholdPercent(80);
    when(saasAppProperties.getFinOps()).thenReturn(finOps);
    when(adminFinOpsService.attributeCosts())
        .thenReturn(new AdminFinOpsCostAttributionResponse(850, 400, 400, 50, List.of()));

    var status = service.getBudgetStatus();

    assertThat(status.alert()).isTrue();
    assertThat(status.utilizationPercent()).isEqualTo(85.0);
  }
}
