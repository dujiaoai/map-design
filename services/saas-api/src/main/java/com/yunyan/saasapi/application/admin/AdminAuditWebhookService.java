package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookCursorRepository;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookConfigResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookService {

  private final SaasAppProperties saasAppProperties;
  private final AdminAuditWebhookCursorRepository cursorRepository;
  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final AdminAuditLogRepository adminAuditLogRepository;

  public AdminAuditWebhookConfigResponse getConfig() {
    var audit = saasAppProperties.getAudit();
    var configured = StringUtils.hasText(audit.getWebhookUrl());
    var deliveryMode = audit.isWebhookEnabled() && configured ? "webhook" : "csv_only";
    var cursor = cursorRepository.findDefault().orElse(null);
    var lastDeliveredId = cursor == null ? null : cursor.getLastDeliveredId();
    var pendingEstimate = adminAuditLogRepository.countUndeliveredAfter(lastDeliveredId);
    var lastDeliveredAt =
        cursor == null || cursor.getLastDeliveredAt() == null
            ? null
            : cursor.getLastDeliveredAt().toEpochMilli();
    return new AdminAuditWebhookConfigResponse(
        audit.isWebhookEnabled(),
        configured,
        audit.getWebhookFormat(),
        deliveryMode,
        pendingEstimate,
        deadLetterRepository.countAll(),
        lastDeliveredAt,
        StringUtils.hasText(audit.getWebhookSigningSecret()),
        audit.getDeadLetterMaxAttempts(),
        audit.getDeadLetterRetryIntervalMs(),
        StringUtils.hasText(audit.getAlertWebhookUrl()));
  }
}
