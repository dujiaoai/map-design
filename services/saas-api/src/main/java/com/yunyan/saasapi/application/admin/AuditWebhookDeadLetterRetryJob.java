package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AuditWebhookDeadLetterRetryJob {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookDeadLetterRetryJob.class);
  private static final int BATCH_SIZE = 20;

  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final AuditWebhookHttpClient auditWebhookHttpClient;
  private final AuditWebhookHmacSigner hmacSigner;
  private final SaasAppProperties saasAppProperties;
  private final AuditWebhookAlertService alertService;

  @Scheduled(
      fixedDelayString = "${saas.audit.dead-letter-retry-ms:600000}",
      initialDelayString = "${saas.audit.dead-letter-retry-ms:600000}")
  public void retryDeadLetters() {
    var audit = saasAppProperties.getAudit();
    if (!audit.isWebhookEnabled() || !StringUtils.hasText(audit.getWebhookUrl())) {
      return;
    }
    var maxAttempts = Math.max(audit.getDeadLetterMaxAttempts(), 1);
    var rows = deadLetterRepository.listEligibleForRetry(maxAttempts, BATCH_SIZE);
    if (rows.isEmpty()) {
      return;
    }
    for (var row : rows) {
      if (!isBackoffElapsed(row, audit.getDeadLetterRetryIntervalMs())) {
        continue;
      }
      var signature = hmacSigner.sign(audit.getWebhookSigningSecret(), row.getPayload());
      var ok = auditWebhookHttpClient.postJson(audit.getWebhookUrl(), row.getPayload(), signature);
      if (ok) {
        deadLetterRepository.deleteById(row.getId());
        log.info("Replayed audit webhook dead letter {}", row.getId());
      } else {
        deadLetterRepository.incrementAttempts(row.getId(), "Auto retry HTTP failed");
        alertService.routeDeadLetterAlert(row.getAttempts() + 1, row.getLastError());
      }
    }
  }

  private static boolean isBackoffElapsed(
      com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter row, long baseIntervalMs) {
    if (row.getUpdatedAt() == null) {
      return true;
    }
    var multiplier = Math.max(row.getAttempts(), 1);
    var wait = Duration.ofMillis(Math.max(baseIntervalMs, 1L) * multiplier);
    return row.getUpdatedAt().plus(wait).isBefore(Instant.now());
  }
}
