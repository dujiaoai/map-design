package com.yunyan.billingapi.application.reconciliation;

import com.yunyan.billingapi.application.admin.AdminBillingReconciliationService;
import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.ops.BillingOpsAlertService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.TenantRlsBypass;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReconciliationDailyAlertJob {

  private static final Logger log = LoggerFactory.getLogger(ReconciliationDailyAlertJob.class);

  private final AdminBillingReconciliationService reconciliationService;
  private final BillingOpsAlertService opsAlertService;
  private final BillingMetrics billingMetrics;
  private final BillingAppProperties billingAppProperties;

  public ReconciliationDailyAlertJob(
      AdminBillingReconciliationService reconciliationService,
      BillingOpsAlertService opsAlertService,
      BillingMetrics billingMetrics,
      BillingAppProperties billingAppProperties) {
    this.reconciliationService = reconciliationService;
    this.opsAlertService = opsAlertService;
    this.billingMetrics = billingMetrics;
    this.billingAppProperties = billingAppProperties;
  }

  @Scheduled(cron = "${billing.reconciliation.alert-cron:0 0 2 * * *}")
  public void checkYesterdayReconciliation() {
    if (!billingAppProperties.getReconciliation().isAlertJobEnabled()) {
      return;
    }
    TenantRlsBypass.run(this::runForYesterday);
  }

  /** Visible for integration tests; scheduled entry uses {@link #checkYesterdayReconciliation()}. */
  public void runForYesterday() {
    var yesterday = LocalDate.now(ZoneOffset.UTC).minusDays(1);
    var report = reconciliationService.getDailyReport(yesterday);
    if (report.balanced()) {
      return;
    }
    var created = opsAlertService.recordReconciliationUnbalanced(yesterday, report);
    if (created) {
      billingMetrics.recordReconciliationUnbalanced();
      log.warn(
          "Billing reconciliation unbalanced for {} ({} discrepancies)",
          yesterday,
          report.discrepancies().size());
    }
  }
}
