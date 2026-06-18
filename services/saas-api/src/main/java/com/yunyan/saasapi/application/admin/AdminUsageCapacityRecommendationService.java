package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.web.dto.admin.AdminUsageCapacityRecommendation;
import com.yunyan.saasapi.web.dto.admin.AdminUsageForecastResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUsageCapacityRecommendationService {

  private final AdminUsageForecastService forecastService;

  public List<AdminUsageCapacityRecommendation> recommend() {
    AdminUsageForecastResponse forecast = forecastService.forecast();
    List<AdminUsageCapacityRecommendation> recommendations = new ArrayList<>();
    recommendMetric(forecast.newUsers(), "seats", recommendations);
    recommendMetric(forecast.auditEvents(), "auditRetention", recommendations);
    recommendMetric(forecast.billingApiCalls(), "billingPlan", recommendations);
    return recommendations;
  }

  private static void recommendMetric(
      List<com.yunyan.saasapi.web.dto.admin.AdminUsageForecastDay> days,
      String category,
      List<AdminUsageCapacityRecommendation> out) {
    if (days.isEmpty()) {
      return;
    }
    var avg =
        days.stream().mapToLong(com.yunyan.saasapi.web.dto.admin.AdminUsageForecastDay::projectedValue).average();
    if (avg.isEmpty()) {
      return;
    }
    var projected = avg.getAsDouble();
    var trend = days.get(days.size() - 1).projectedValue() - days.get(0).projectedValue();
    String action;
    if (trend > 5) {
      action = "increase";
    } else if (trend < -5) {
      action = "decrease";
    } else {
      action = "hold";
    }
    out.add(
        new AdminUsageCapacityRecommendation(
            category, action, Math.round(projected), "7-day linear projection trend=" + trend));
  }
}
