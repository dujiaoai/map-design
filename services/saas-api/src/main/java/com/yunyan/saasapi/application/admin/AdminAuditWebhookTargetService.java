package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.AuditWebhookTargetRepository;
import com.yunyan.saasapi.domain.entity.AuditWebhookTarget;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookTargetDto;
import com.yunyan.saasapi.web.dto.admin.AdminAuditWebhookTargetListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateAuditWebhookTargetRequest;
import com.yunyan.saasapi.web.dto.admin.PatchAuditWebhookTargetRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AdminAuditWebhookTargetService {

  private final AuditWebhookTargetRepository targetRepository;
  private final AdminAuditLogService adminAuditLogService;
  private final SaasAppProperties saasAppProperties;

  public AdminAuditWebhookTargetListResponse listTargets() {
    var primary = saasAppProperties.getAudit().getWebhookUrl();
    var targets =
        targetRepository.findAllOrdered().stream().map(this::toDto).toList();
    return new AdminAuditWebhookTargetListResponse(primary, targets);
  }

  @Transactional
  public AdminAuditWebhookTargetDto createTarget(
      SaasPrincipal principal, CreateAuditWebhookTargetRequest request) {
    var row = new AuditWebhookTarget();
    row.setId(UUID.randomUUID());
    row.setUrl(requireUrl(request.url()));
    row.setFormat(normalizeFormat(request.format()));
    row.setEnabled(request.enabled() == null || request.enabled());
    row.setPriority(request.priority() == null ? 0 : request.priority());
    row.setRegion("default");
    row.setConsecutiveFailures(0);
    row.setCreatedAt(Instant.now());
    row.setUpdatedAt(Instant.now());
    targetRepository.insert(row);
    adminAuditLogService.recordPlatformUserAction(
        principal, "audit.webhook_target.create", null, "Created audit webhook target");
    return toDto(row);
  }

  @Transactional
  public AdminAuditWebhookTargetDto patchTarget(
      SaasPrincipal principal, UUID id, PatchAuditWebhookTargetRequest request) {
    var row =
        targetRepository
            .findById(id)
            .orElseThrow(() -> AuthException.notFound("Webhook target not found"));
    if (StringUtils.hasText(request.url())) {
      row.setUrl(requireUrl(request.url()));
    }
    if (StringUtils.hasText(request.format())) {
      row.setFormat(normalizeFormat(request.format()));
    }
    if (request.enabled() != null) {
      row.setEnabled(request.enabled());
    }
    if (request.priority() != null) {
      row.setPriority(request.priority());
    }
    row.setUpdatedAt(Instant.now());
    targetRepository.update(row);
    adminAuditLogService.recordPlatformUserAction(
        principal, "audit.webhook_target.patch", null, "Updated audit webhook target " + id);
    return toDto(row);
  }

  @Transactional
  public void deleteTarget(SaasPrincipal principal, UUID id) {
    if (targetRepository.findById(id).isEmpty()) {
      throw AuthException.notFound("Webhook target not found");
    }
    targetRepository.deleteById(id);
    adminAuditLogService.recordPlatformUserAction(
        principal, "audit.webhook_target.delete", null, "Deleted audit webhook target " + id);
  }

  private AdminAuditWebhookTargetDto toDto(AuditWebhookTarget row) {
    return new AdminAuditWebhookTargetDto(
        row.getId().toString(),
        row.getUrl(),
        row.getFormat(),
        Boolean.TRUE.equals(row.getEnabled()),
        row.getPriority(),
        StringUtils.hasText(row.getRegion()) ? row.getRegion() : "default",
        row.getCreatedAt().toEpochMilli(),
        row.getConsecutiveFailures() == null ? 0 : row.getConsecutiveFailures(),
        row.getLastHealthCheckAt() == null ? null : row.getLastHealthCheckAt().toEpochMilli(),
        row.getUnhealthySince() == null ? null : row.getUnhealthySince().toEpochMilli());
  }

  private static String requireUrl(String url) {
    if (!StringUtils.hasText(url)) {
      throw AuthException.badRequest("url is required");
    }
    return url.trim();
  }

  private static String normalizeFormat(String format) {
    if (!StringUtils.hasText(format)) {
      return "jsonl";
    }
    var normalized = format.trim().toLowerCase();
    if (!normalized.equals("jsonl") && !normalized.equals("ndjson")) {
      throw AuthException.badRequest("format must be jsonl or ndjson");
    }
    return normalized;
  }
}
