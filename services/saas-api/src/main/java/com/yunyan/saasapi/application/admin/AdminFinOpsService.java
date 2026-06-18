package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsCostAttributionResponse;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsTenantConsumer;
import com.yunyan.saasapi.web.dto.admin.AdminUsageDayBucket;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminFinOpsService {

  private static final int TOP_CONSUMERS = 5;

  private final AdminUsageTrendsService usageTrendsService;
  private final TenantRepository tenantRepository;
  private final SaasAppProperties saasAppProperties;

  public AdminFinOpsCostAttributionResponse attributeCosts() {
    var finOps = saasAppProperties.getFinOps();
    var days = usageTrendsService.getTrends().days();
    long billingCalls = sumMetric(days, AdminUsageDayBucket::billingApiCallsPerDay);
    long seats = sumMetric(days, AdminUsageDayBucket::activeTenants);
    long storageGb = 0;

    var billingCost = (billingCalls / 10000.0) * finOps.getBillingApiCallUnitCost();
    var seatCost = seats * finOps.getSeatUnitCost();
    var storageCost = storageGb * finOps.getStorageGbUnitCost();
    var total = billingCost + seatCost + storageCost;

    var consumers = buildTopConsumers(days, finOps);
    return new AdminFinOpsCostAttributionResponse(total, billingCost, seatCost, storageCost, consumers);
  }

  private List<AdminFinOpsTenantConsumer> buildTopConsumers(
      List<AdminUsageDayBucket> days, SaasAppProperties.FinOps finOps) {
    if (days.isEmpty()) {
      return List.of();
    }
    var latest = days.get(days.size() - 1);
    List<AdminFinOpsTenantConsumer> consumers = new ArrayList<>();
    for (var tenant : tenantRepository.findAllTenants()) {
      var calls = latest.billingApiCallsPerDay();
      var seatProxy = latest.activeTenants();
      var cost =
          (calls / 10000.0) * finOps.getBillingApiCallUnitCost() + seatProxy * finOps.getSeatUnitCost();
      consumers.add(
          new AdminFinOpsTenantConsumer(
              tenant.getId().toString(), tenant.getName(), cost, calls, seatProxy));
    }
    consumers.sort(Comparator.comparingDouble(AdminFinOpsTenantConsumer::estimatedMonthlyCostUsd).reversed());
    return consumers.size() <= TOP_CONSUMERS ? consumers : consumers.subList(0, TOP_CONSUMERS);
  }

  private static long sumMetric(
      List<AdminUsageDayBucket> days, java.util.function.ToLongFunction<AdminUsageDayBucket> metric) {
    long sum = 0;
    for (var day : days) {
      sum += metric.applyAsLong(day);
    }
    return sum;
  }
}
