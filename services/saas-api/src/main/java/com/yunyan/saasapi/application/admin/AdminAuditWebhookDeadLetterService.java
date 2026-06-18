package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AdminAuditWebhookDeadLetterRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookDeadLetterDto;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookDeadLetterListResponse;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookDeadLetterReplayResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookDeadLetterService {

  private final AdminAuditWebhookDeadLetterRepository deadLetterRepository;
  private final AuditWebhookHttpClient auditWebhookHttpClient;
  private final AuditWebhookHmacSigner hmacSigner;
  private final SaasAppProperties saasAppProperties;
  private final AdminAuditLogService adminAuditLogService;

  public AdminAuditWebhookDeadLetterListResponse list(Integer page, Integer size) {
    var params = new AdminListParams(null, page, size);
    var result = deadLetterRepository.list(params.resolvePage(), params.resolveSize());
    var items = result.items().stream().map(this::toDto).toList();
    return new AdminAuditWebhookDeadLetterListResponse(
        items, result.total(), params.resolvePage(), params.resolveSize());
  }

  @Transactional
  public AdminAuditWebhookDeadLetterReplayResponse replay(SaasPrincipal principal, UUID id) {
    var row =
        deadLetterRepository
            .findById(id)
            .orElseThrow(() -> AuthException.notFound("Dead letter not found"));
    var audit = saasAppProperties.getAudit();
    if (!audit.isWebhookEnabled() || !StringUtils.hasText(audit.getWebhookUrl())) {
      throw AuthException.badRequest("Audit webhook delivery is not enabled");
    }
    var signature = hmacSigner.sign(audit.getWebhookSigningSecret(), row.getPayload());
    var ok = auditWebhookHttpClient.postJson(audit.getWebhookUrl(), row.getPayload(), signature);
    if (ok) {
      deadLetterRepository.deleteById(id);
      adminAuditLogService.recordPlatformUserAction(
          principal, "audit.webhook.dead-letter.replay", null, "id=" + id + " success=true");
      return new AdminAuditWebhookDeadLetterReplayResponse(id.toString(), true, "Delivered and removed");
    }
    deadLetterRepository.incrementAttempts(id, "Manual replay HTTP failed");
    adminAuditLogService.recordPlatformUserAction(
        principal, "audit.webhook.dead-letter.replay", null, "id=" + id + " success=false");
    return new AdminAuditWebhookDeadLetterReplayResponse(id.toString(), false, "HTTP delivery failed");
  }

  @Transactional
  public void delete(SaasPrincipal principal, UUID id) {
    if (deadLetterRepository.findById(id).isEmpty()) {
      throw AuthException.notFound("Dead letter not found");
    }
    deadLetterRepository.deleteById(id);
    adminAuditLogService.recordPlatformUserAction(
        principal, "audit.webhook.dead-letter.delete", null, "id=" + id);
  }

  private AdminAuditWebhookDeadLetterDto toDto(
      com.yunyan.saasapi.domain.entity.SysAdminAuditWebhookDeadLetter row) {
    return new AdminAuditWebhookDeadLetterDto(
        row.getId().toString(),
        row.getLogId().toString(),
        row.getAttempts(),
        row.getLastError(),
        row.getCreatedAt() == null ? 0L : row.getCreatedAt().toEpochMilli(),
        row.getUpdatedAt() == null ? 0L : row.getUpdatedAt().toEpochMilli());
  }
}
