package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AdminUsageAlertJob {

  private static final Logger log = LoggerFactory.getLogger(AdminUsageAlertJob.class);

  private final AdminUsageAnomalyService anomalyService;
  private final SaasAppProperties saasAppProperties;
  private final AuditWebhookHttpClient auditWebhookHttpClient;

  @Scheduled(
      fixedDelayString = "${saas.audit.usage-alert-ms:3600000}",
      initialDelayString = "${saas.audit.usage-alert-ms:3600000}")
  public void checkAndAlert() {
    var anomalies = anomalyService.detectAnomalies().anomalies();
    if (anomalies.isEmpty()) {
      return;
    }
    log.warn("Usage anomalies detected: {} spike(s)", anomalies.size());
    var alertUrl = saasAppProperties.getAudit().getAlertWebhookUrl();
    if (!StringUtils.hasText(alertUrl)) {
      return;
    }
    var payload =
        anomalies.stream()
            .map(
                a ->
                    "{\"metric\":\""
                        + a.metric()
                        + "\",\"ratio\":"
                        + a.ratio()
                        + ",\"day\":\""
                        + a.day()
                        + "\"}")
            .reduce((a, b) -> a + "\n" + b)
            .orElse("");
    auditWebhookHttpClient.postJson(alertUrl, payload, null);
  }
}
