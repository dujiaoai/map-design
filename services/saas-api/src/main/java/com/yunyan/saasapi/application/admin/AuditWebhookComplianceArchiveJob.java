package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookCursorRepository;
import com.yunyan.saasapi.domain.AuditWebhookArchiveRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookArchive;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class AuditWebhookComplianceArchiveJob {

  private static final Logger log = LoggerFactory.getLogger(AuditWebhookComplianceArchiveJob.class);

  private final SaasAppProperties saasAppProperties;
  private final AdminAuditLogRepository adminAuditLogRepository;
  private final AdminAuditWebhookCursorRepository cursorRepository;
  private final AuditWebhookPayloadBuilder payloadBuilder;
  private final AuditWebhookArchiveRepository archiveRepository;

  @Scheduled(
      fixedDelayString = "${saas.audit.compliance-archive-ms:600000}",
      initialDelayString = "${saas.audit.compliance-archive-ms:600000}")
  public void archiveDeliveredBatchBeforeCursorAdvance() {
    var audit = saasAppProperties.getAudit();
    if (!audit.isWebhookEnabled()) {
      return;
    }
    var cursor = cursorRepository.findDefault().orElse(null);
    var lastDeliveredId = cursor == null ? null : cursor.getLastDeliveredId();
    if (lastDeliveredId == null) {
      return;
    }
    var batchSize = Math.max(1, audit.getWebhookBatchSize());
    var batch = adminAuditLogRepository.findUndeliveredAfter(lastDeliveredId, batchSize);
    if (batch.isEmpty()) {
      return;
    }
    var payload = payloadBuilder.buildBatchPayload(audit.getWebhookFormat(), batch);
    if (!StringUtils.hasText(payload)) {
      return;
    }
    var region = saasAppProperties.getObjectStorage().getRegion();
    var row = new AuditWebhookArchive();
    row.setId(UUID.randomUUID());
    row.setPayload(payload);
    row.setRegion(StringUtils.hasText(region) ? region : "default");
    row.setArchivedAt(Instant.now());
    archiveRepository.insert(row);
    log.debug("Archived audit webhook batch ({} events) to region {}", batch.size(), row.getRegion());
  }
}
