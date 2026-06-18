package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import com.yunyan.saasapi.web.dto.admin.AdminUsageTrendsResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminUsageForecastServiceTest {

  @Mock private AdminUsageTrendsService usageTrendsService;

  @InjectMocks private AdminUsageForecastService service;

  @Test
  void forecast_projectsSevenDays() {
    when(usageTrendsService.getTrends())
        .thenReturn(
            new AdminUsageTrendsResponse(
                List.of(
                    new AdminUsageDayBucket("2026-06-12", 1, 10, 2, 5, 0),
                    new AdminUsageDayBucket("2026-06-18", 3, 20, 2, 15, 0))));

    var forecast = service.forecast();

    assertThat(forecast.newUsers()).hasSize(7);
    assertThat(forecast.auditEvents()).hasSize(7);
  }
}
