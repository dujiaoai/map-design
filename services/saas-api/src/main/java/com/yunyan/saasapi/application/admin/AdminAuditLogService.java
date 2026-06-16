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
  public static final int EXPORT_MAX_ROWS = 5000;

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

  public byte[] exportCsv(AuditLogListParams params) {
    var exportParams =
        new AuditLogListParams(
            params.q(),
            1,
            EXPORT_MAX_ROWS,
            params.action(),
            params.crossTenant(),
            params.tenantId(),
            params.from(),
            params.to());
    var page = adminAuditLogRepository.findLogs(exportParams);
    return AdminAuditLogCsvExporter.toCsvBytes(page.items());
  }

  @Transactional
  public void recordTenantAction(
      SaasPrincipal principal, String action, UUID tenantId, String detail) {
    if (principal == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(principal.userId());
    log.setActorEmail(principal.email());
    log.setActorTenantId(principal.tenantId());
    log.setAction(action);
    log.setResourceType("tenant");
    log.setResourceId(tenantId.toString());
    log.setTargetTenantId(tenantId);
    log.setCrossTenant(isCrossTenant(principal, tenantId));
    log.setDetail(detail);
    log.setCreatedAt(Instant.now());
    adminAuditLogRepository.insert(log);
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

  @Transactional
  public void recordPlatformUserAction(
      SaasPrincipal principal, String action, UUID resourceUserId, String detail) {
    if (principal == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(principal.userId());
    log.setActorEmail(principal.email());
    log.setActorTenantId(principal.tenantId());
    log.setAction(action);
    log.setResourceType("platform_user");
    log.setResourceId(resourceUserId == null ? null : resourceUserId.toString());
    log.setTargetTenantId(null);
    log.setCrossTenant(false);
    log.setDetail(detail);
    log.setCreatedAt(Instant.now());
    adminAuditLogRepository.insert(log);
  }

  @Transactional
  public void recordRolePermissionUpdate(
      SaasPrincipal principal, UUID roleId, String roleCode, String detail) {
    if (principal == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(principal.userId());
    log.setActorEmail(principal.email());
    log.setActorTenantId(principal.tenantId());
    log.setAction("role.permissions.update");
    log.setResourceType("role");
    log.setResourceId(roleId == null ? null : roleId.toString());
    log.setTargetTenantId(null);
    log.setCrossTenant(false);
    log.setDetail(roleCode + ": " + detail);
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
