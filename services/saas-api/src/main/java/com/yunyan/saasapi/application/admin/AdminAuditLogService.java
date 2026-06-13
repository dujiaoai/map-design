package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.AdminAuditLogRepository;
import com.yunyan.saasapi.domain.entity.SysAdminAuditLog;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogDto;
import com.yunyan.saasapi.web.dto.admin.AdminAuditLogListResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final AdminAuditLogRepository adminAuditLogRepository;

  public AdminAuditLogListResponse listLogs(AuditLogListParams params) {
    var page = adminAuditLogRepository.findLogs(params);
    var logs = page.items().stream().map(this::toDto).toList();
    if (params.toListParams().isPaginated()) {
      return new AdminAuditLogListResponse(
          logs, page.total(), params.toListParams().resolvePage(), params.toListParams().resolveSize());
    }
    return new AdminAuditLogListResponse(logs);
  }

  @Transactional
  public void recordMemberAction(
      SaasPrincipal principal,
      String action,
      UUID targetTenantId,
      UUID resourceUserId,
      String detail) {
    if (principal == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(principal.userId());
    log.setActorEmail(principal.email());
    log.setActorTenantId(principal.tenantId());
    log.setAction(action);
    log.setResourceType("tenant_member");
    log.setResourceId(resourceUserId == null ? null : resourceUserId.toString());
    log.setTargetTenantId(targetTenantId);
    log.setCrossTenant(isCrossTenant(principal, targetTenantId));
    log.setDetail(detail);
    log.setCreatedAt(Instant.now());
    adminAuditLogRepository.insert(log);
  }

  private static boolean isCrossTenant(SaasPrincipal principal, UUID targetTenantId) {
    if (!principal.roleCodes().contains(PLATFORM_ADMIN)) {
      return false;
    }
    return targetTenantId != null && !principal.tenantId().equals(targetTenantId);
  }

  private AdminAuditLogDto toDto(SysAdminAuditLog log) {
    var createdAt = log.getCreatedAt() == null ? 0L : log.getCreatedAt().toEpochMilli();
    return new AdminAuditLogDto(
        log.getId().toString(),
        log.getActorEmail(),
        log.getAction(),
        log.getResourceType(),
        log.getResourceId(),
        log.getTargetTenantId() == null ? null : log.getTargetTenantId().toString(),
        log.isCrossTenant(),
        log.getDetail(),
        createdAt);
  }
}
