package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookCursorRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
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
  private final AdminAuditLogRepository adminAuditLogRepository;
  private final AdminAuditWebhookCursorRepository cursorRepository;
  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final AuditWebhookPayloadBuilder payloadBuilder;
  private final AuditWebhookHmacSigner hmacSigner;
  private final AuditWebhookAlertService alertService;

  @Scheduled(
      fixedDelayString = "${saas.audit.webhook-delivery-ms:300000}",
      initialDelayString = "${saas.audit.webhook-delivery-ms:300000}")
  public void deliverPendingAuditEvents() {
    var audit = saasAppProperties.getAudit();
    if (!audit.isWebhookEnabled() || !StringUtils.hasText(audit.getWebhookUrl())) {
      return;
    }
    var cursor = cursorRepository.findDefault().orElse(null);
    var lastDeliveredId = cursor == null ? null : cursor.getLastDeliveredId();
    var batchSize = Math.max(1, audit.getWebhookBatchSize());
    var batch = adminAuditLogRepository.findUndeliveredAfter(lastDeliveredId, batchSize);
    if (batch.isEmpty()) {
      return;
    }
    var payload = payloadBuilder.buildBatchPayload(audit.getWebhookFormat(), batch);
    var signature = hmacSigner.sign(audit.getWebhookSigningSecret(), payload);
    var ok = auditWebhookHttpClient.postJson(audit.getWebhookUrl(), payload, signature);
    if (!ok) {
      for (var entry : batch) {
        deadLetterRepository.insert(
            entry.getId(),
            payloadBuilder.buildSingleEventPayload(entry),
            "HTTP delivery failed");
      }
      alertService.notifyIfDeadLettersAccumulated(batch.size());
      log.warn("Audit webhook batch delivery failed, {} event(s) moved to dead letter", batch.size());
      return;
    }
    var last = batch.get(batch.size() - 1);
    cursorRepository.upsert(last.getId(), last.getCreatedAt());
    log.debug("Audit webhook delivered {} event(s) to {}", batch.size(), audit.getWebhookUrl());
  }
}
