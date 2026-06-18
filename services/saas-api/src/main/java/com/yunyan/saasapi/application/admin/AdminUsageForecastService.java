package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import com.yunyan.saasapi.web.dto.admin.AdminUsageForecastDay;
import com.yunyan.saasapi.web.dto.admin.AdminUsageForecastResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUsageForecastService {

  private static final int FORECAST_DAYS = 7;

  private final AdminUsageTrendsService usageTrendsService;

  public AdminUsageForecastResponse forecast() {
    var days = usageTrendsService.getTrends().days();
    return new AdminUsageForecastResponse(
        project(days, AdminUsageDayBucket::newUsers, "newUsers"),
        project(days, AdminUsageDayBucket::auditEvents, "auditEvents"),
        project(days, AdminUsageDayBucket::billingApiCallsPerDay, "billingApiCalls"));
  }

  private List<AdminUsageForecastDay> project(
      List<AdminUsageDayBucket> history,
      java.util.function.ToLongFunction<AdminUsageDayBucket> metric,
      String metricName) {
    if (history.isEmpty()) {
      return List.of();
    }
    var slope = linearSlope(history, metric);
    var last = history.get(history.size() - 1);
    var baseDate = java.time.LocalDate.parse(last.date());
    var lastValue = metric.applyAsLong(last);
    List<AdminUsageForecastDay> forecast = new ArrayList<>(FORECAST_DAYS);
    for (var i = 1; i <= FORECAST_DAYS; i++) {
      var projected = Math.max(0, Math.round(lastValue + slope * i));
      forecast.add(
          new AdminUsageForecastDay(baseDate.plusDays(i).toString(), metricName, projected));
    }
    return forecast;
  }

  private static double linearSlope(
      List<AdminUsageDayBucket> history, java.util.function.ToLongFunction<AdminUsageDayBucket> metric) {
    if (history.size() < 2) {
      return 0;
    }
    var n = history.size();
    double sumX = 0;
    double sumY = 0;
    double sumXY = 0;
    double sumX2 = 0;
    for (var i = 0; i < n; i++) {
      sumX += i;
      var y = metric.applyAsLong(history.get(i));
      sumY += y;
      sumXY += i * y;
      sumX2 += (double) i * i;
    }
    var denom = n * sumX2 - sumX * sumX;
    if (denom == 0) {
      return 0;
    }
    return (n * sumXY - sumX * sumY) / denom;
  }
}
