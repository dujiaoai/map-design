package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AuditWebhookAlertService {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookAlertService.class);

  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final AuditWebhookHttpClient auditWebhookHttpClient;
  private final SaasAppProperties saasAppProperties;

  public void notifyIfDeadLettersAccumulated(long batchSize) {
    var total = deadLetterRepository.countAll();
    if (total > 0 && total % 10 == 0) {
      log.warn("Audit webhook dead letter count reached {} (latest batch size={})", total, batchSize);
      routeDeadLetterAlert(total, "dead-letter threshold reached");
    }
  }

  public void routeDeadLetterAlert(long attempts, String lastError) {
    var alertUrl = saasAppProperties.getAudit().getAlertWebhookUrl();
    if (!StringUtils.hasText(alertUrl)) {
      return;
    }
    var payload =
        "{\"type\":\"audit_webhook_dead_letter\",\"attempts\":"
            + attempts
            + ",\"lastError\":"
            + jsonString(lastError)
            + "}";
    auditWebhookHttpClient.postJson(alertUrl, payload, null);
  }

  private static String jsonString(String value) {
    if (value == null) {
      return "null";
    }
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }
}
