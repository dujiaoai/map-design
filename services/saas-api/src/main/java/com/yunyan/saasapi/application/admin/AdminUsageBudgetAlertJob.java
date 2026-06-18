package com.yunyan.saasapi.application.admin;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminUsageBudgetAlertJob {

  private static final Logger log = LoggerFactory.getLogger(AdminUsageBudgetAlertJob.class);

  private final AdminUsageBudgetAlertService budgetAlertService;

  @Scheduled(
      fixedDelayString = "${saas.fin-ops.budget-check-ms:900000}",
      initialDelayString = "${saas.fin-ops.budget-check-ms:900000}")
  public void checkBudget() {
    var status = budgetAlertService.getBudgetStatus();
    if (status.alert()) {
      log.warn(
          "FinOps budget alert: estimated ${} vs budget ${} ({}%)",
          status.estimatedMonthlyCostUsd(),
          status.monthlyBudgetUsd(),
          String.format("%.1f", status.utilizationPercent()));
    }
  }
}
