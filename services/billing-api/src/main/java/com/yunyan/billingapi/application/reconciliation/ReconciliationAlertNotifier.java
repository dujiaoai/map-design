package com.yunyan.billingapi.application.reconciliation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.web.dto.AdminReconciliationDailyResponse;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class ReconciliationAlertNotifier {

  private static final Logger log = LoggerFactory.getLogger(ReconciliationAlertNotifier.class);

  private final BillingAppProperties billingAppProperties;
  private final RestClient restClient;
  private final ObjectMapper objectMapper;

  public ReconciliationAlertNotifier(
      BillingAppProperties billingAppProperties,
      RestClient restClient,
      ObjectMapper objectMapper) {
    this.billingAppProperties = billingAppProperties;
    this.restClient = restClient;
    this.objectMapper = objectMapper;
  }

  public void notifyUnbalancedIfConfigured(
      LocalDate date, AdminReconciliationDailyResponse report) {
    var notify = billingAppProperties.getReconciliation().getNotify();
    if (!notify.isEnabled()) {
      return;
    }
    var webhookUrl = notify.getWebhookUrl();
    if (webhookUrl == null || webhookUrl.isBlank()) {
      log.warn("Reconciliation notify enabled but billing.reconciliation.notify.webhook-url is empty");
      return;
    }

    try {
      var body = buildBody(notify.getProvider(), date, report);
      restClient
          .post()
          .uri(webhookUrl)
          .contentType(MediaType.APPLICATION_JSON)
          .body(body)
          .retrieve()
          .toBodilessEntity();
      log.info("Sent reconciliation unbalanced webhook for UTC {}", date);
    } catch (RestClientException | JsonProcessingException ex) {
      log.error("Failed to send reconciliation webhook for UTC {}: {}", date, ex.getMessage());
    }
  }

  String buildBody(String provider, LocalDate date, AdminReconciliationDailyResponse report)
      throws JsonProcessingException {
    if ("generic".equalsIgnoreCase(provider)) {
      var payload = new LinkedHashMap<String, Object>();
      payload.put("event", "billing.reconciliation.unbalanced");
      payload.put("date", date.toString());
      payload.put("balanced", report.balanced());
      payload.put("discrepancyCount", report.discrepancies().size());
      payload.put("discrepancies", report.discrepancies());
      return objectMapper.writeValueAsString(payload);
    }

    var text = buildFeishuText(date, report);
    return objectMapper.writeValueAsString(
        Map.of("msg_type", "text", "content", Map.of("text", text)));
  }

  static String buildFeishuText(LocalDate date, AdminReconciliationDailyResponse report) {
    var builder = new StringBuilder();
    builder.append("[P0] 计费日对账差异\n");
    builder.append("UTC 日期：").append(date).append('\n');
    builder.append("差异项数：").append(report.discrepancies().size()).append('\n');
    for (var item : report.discrepancies()) {
      builder.append("- ").append(item).append('\n');
    }
    builder.append("请登录 Admin → 计费 → 日对账核对订单与积分流水。");
    return builder.toString().trim();
  }
}
