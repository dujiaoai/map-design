package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.web.dto.admin.AdminFinOpsBudgetStatusResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUsageBudgetAlertService {

  private final AdminFinOpsService adminFinOpsService;
  private final SaasAppProperties saasAppProperties;

  private volatile boolean overBudgetFlag;

  public AdminFinOpsBudgetStatusResponse getBudgetStatus() {
    var finOps = saasAppProperties.getFinOps();
    var attribution = adminFinOpsService.attributeCosts();
    var budget = finOps.getMonthlyBudgetUsd();
    var estimated = attribution.totalEstimatedMonthlyCostUsd();
    var thresholdRatio = finOps.getAlertThresholdPercent() / 100.0;
    var alert = budget > 0 && estimated >= budget * thresholdRatio;
    var overBudget = budget > 0 && estimated >= budget;
    overBudgetFlag = overBudget && finOps.isBudgetThrottleEnabled();
    var utilizationPercent = budget > 0 ? (estimated / budget) * 100.0 : 0.0;
    return new AdminFinOpsBudgetStatusResponse(
        budget, estimated, utilizationPercent, alert, overBudget, overBudgetFlag);
  }

  public boolean isBudgetThrottleActive() {
    return overBudgetFlag;
  }
}
