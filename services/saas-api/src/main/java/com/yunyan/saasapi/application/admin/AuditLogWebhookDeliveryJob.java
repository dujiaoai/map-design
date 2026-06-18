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
public class AuditLogWebhookDeliveryJob {

  private static final Logger log = LoggerFactory.getLogger(AuditLogWebhookDeliveryJob.class);

  private final SaasAppProperties saasAppProperties;
  private final AuditWebhookHttpClient auditWebhookHttpClient;

  @Scheduled(
      fixedDelayString = "${saas.audit.webhook-delivery-ms:300000}",
      initialDelayString = "${saas.audit.webhook-delivery-ms:300000}")
  public void deliverPendingAuditEvents() {
    var audit = saasAppProperties.getAudit();
    if (!audit.isWebhookEnabled() || !StringUtils.hasText(audit.getWebhookUrl())) {
      return;
    }
    var payload =
        "{\"type\":\"audit.batch.skeleton\",\"format\":\""
            + audit.getWebhookFormat()
            + "\",\"events\":[]}";
    var ok = auditWebhookHttpClient.postJson(audit.getWebhookUrl(), payload);
    if (ok) {
      log.debug("Audit webhook heartbeat delivered to {}", audit.getWebhookUrl());
    }
  }
}
