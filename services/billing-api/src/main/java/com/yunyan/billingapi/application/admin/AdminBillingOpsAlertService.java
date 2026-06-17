package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.application.ops.BillingOpsAlertService;
import com.yunyan.billingapi.domain.entity.BillingOpsAlert;
import com.yunyan.billingapi.domain.mapper.BillingOpsAlertMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminOpsAlertDto;
import com.yunyan.billingapi.web.dto.AdminOpsAlertListResponse;
import com.yunyan.billingapi.web.dto.AdminOpsAlertResolveResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingOpsAlertService {

  private final BillingOpsAlertMapper alertMapper;
  private final AdminAuditLogService adminAuditLogService;

  public AdminBillingOpsAlertService(
      BillingOpsAlertMapper alertMapper, AdminAuditLogService adminAuditLogService) {
    this.alertMapper = alertMapper;
    this.adminAuditLogService = adminAuditLogService;
  }

  public AdminOpsAlertListResponse listOpenAlerts(String alertType, int page, int size) {
    var type =
        StringUtils.hasText(alertType)
            ? alertType.trim()
            : BillingOpsAlertService.ALERT_TYPE_RECONCILIATION_DAILY;
    var limit = Math.clamp(size, 1, 100);
    var offset = Math.max(page, 0) * limit;
    var items = alertMapper.findOpenByType(type, limit, offset);
    var total = alertMapper.countOpenByType(type);
    return new AdminOpsAlertListResponse(
        items.stream().map(AdminBillingOpsAlertService::toDto).toList(), page, limit, total);
  }

  @Transactional
  public AdminOpsAlertResolveResponse resolveAlert(SaasPrincipal principal, UUID alertId) {
    var existing = alertMapper.findById(alertId);
    if (existing == null) {
      throw AuthException.notFound("Ops alert not found");
    }
    if (existing.getResolvedAt() != null) {
      return new AdminOpsAlertResolveResponse(
          alertId.toString(), existing.getResolvedAt(), true);
    }

    var resolvedAt = Instant.now();
    var updated = alertMapper.resolve(alertId, resolvedAt);
    if (updated != 1) {
      var latest = alertMapper.findById(alertId);
      if (latest != null && latest.getResolvedAt() != null) {
        return new AdminOpsAlertResolveResponse(
            alertId.toString(), latest.getResolvedAt(), true);
      }
      throw AuthException.notFound("Ops alert not found");
    }

    adminAuditLogService.recordBillingOpsAlertResolve(principal, existing);
    return new AdminOpsAlertResolveResponse(alertId.toString(), resolvedAt, false);
  }

  private static AdminOpsAlertDto toDto(BillingOpsAlert row) {
    return new AdminOpsAlertDto(
        row.getId().toString(),
        row.getAlertType(),
        row.getSeverity(),
        row.getReferenceKey(),
        row.getTitle(),
        row.getBody(),
        row.getResolvedAt(),
        row.getCreatedAt());
  }
}
