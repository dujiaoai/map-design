package com.yunyan.billingapi.application.ops;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.domain.entity.BillingOpsAlert;
import com.yunyan.billingapi.domain.mapper.BillingOpsAlertMapper;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class BillingOpsAlertService {

  public static final String ALERT_TYPE_RECONCILIATION_DAILY = "reconciliation_daily";
  public static final String SEVERITY_CRITICAL = "critical";

  private final BillingOpsAlertMapper alertMapper;
  private final ObjectMapper objectMapper;

  public BillingOpsAlertService(
      BillingOpsAlertMapper alertMapper, ObjectMapper objectMapper) {
    this.alertMapper = alertMapper;
    this.objectMapper = objectMapper;
  }

  /** @return true when a new alert row was inserted */
  public boolean recordReconciliationUnbalanced(
      LocalDate date, AdminReconciliationDailyResponse report) {
    var alert = new BillingOpsAlert();
    alert.setId(UUID.randomUUID());
    alert.setAlertType(ALERT_TYPE_RECONCILIATION_DAILY);
    alert.setSeverity(SEVERITY_CRITICAL);
    alert.setReferenceKey("reconciliation:" + date);
    alert.setTitle("日对账差异：" + date);
    alert.setBody(buildReconciliationBody(report));
    alert.setPayloadJson(serializePayload(report));
    alert.setCreatedAt(Instant.now());
    try {
      return alertMapper.insert(alert) == 1;
    } catch (DuplicateKeyException ignored) {
      return false;
    }
  }

  public long countOpenReconciliationAlerts() {
    return alertMapper.countOpenByType(ALERT_TYPE_RECONCILIATION_DAILY);
  }

  public Instant latestReconciliationAlertAt() {
    return alertMapper.findLatestCreatedAt(ALERT_TYPE_RECONCILIATION_DAILY);
  }

  private static String buildReconciliationBody(AdminReconciliationDailyResponse report) {
    if (report.discrepancies().isEmpty()) {
      return "UTC 日 " + report.date() + " 对账未平衡，请核对充值/退款订单与积分流水。";
    }
    return "UTC 日 "
        + report.date()
        + " 发现 "
        + report.discrepancies().size()
        + " 项差异："
        + String.join("; ", report.discrepancies());
  }

  private String serializePayload(AdminReconciliationDailyResponse report) {
    try {
      return objectMapper.writeValueAsString(report);
    } catch (JsonProcessingException e) {
      return null;
    }
  }
}
