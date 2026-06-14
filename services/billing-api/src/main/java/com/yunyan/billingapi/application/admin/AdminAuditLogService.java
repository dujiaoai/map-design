package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.SysAdminAuditLog;
import com.yunyan.billingapi.domain.mapper.SysAdminAuditLogMapper;
import com.yunyan.billingapi.security.SaasPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminAuditLogService {

  public static final String ACTION_BILLING_WALLET_ADJUST = "billing.wallet.adjust";
  private static final String RESOURCE_TYPE_BILLING_WALLET = "billing_wallet";
  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";
  private static final int DETAIL_MAX = 512;

  private final SysAdminAuditLogMapper auditLogMapper;

  public AdminAuditLogService(SysAdminAuditLogMapper auditLogMapper) {
    this.auditLogMapper = auditLogMapper;
  }

  public void recordBillingAdjust(
      SaasPrincipal actor,
      UUID targetTenantId,
      UUID targetUserId,
      UUID walletId,
      long amount,
      long balanceAfter,
      String remark,
      String idempotencyKey) {
    if (actor == null) {
      return;
    }

    var detail =
        truncateDetail(
            "amount="
                + amount
                + " balanceAfter="
                + balanceAfter
                + " userId="
                + targetUserId
                + " remark="
                + remark
                + " key="
                + idempotencyKey);

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_WALLET_ADJUST);
    log.setResourceType(RESOURCE_TYPE_BILLING_WALLET);
    log.setResourceId(walletId.toString());
    log.setTargetTenantId(targetTenantId);
    log.setCrossTenant(isCrossTenant(actor, targetTenantId));
    log.setDetail(detail);
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  private static boolean isCrossTenant(SaasPrincipal actor, UUID targetTenantId) {
    var roles = actor.roleCodes() != null ? actor.roleCodes() : List.<String>of();
    if (!roles.contains(PLATFORM_ADMIN)) {
      return false;
    }
    return targetTenantId != null && !targetTenantId.equals(actor.tenantId());
  }

  private static String truncateDetail(String detail) {
    if (!StringUtils.hasText(detail) || detail.length() <= DETAIL_MAX) {
      return detail;
    }
    return detail.substring(0, DETAIL_MAX - 3) + "...";
  }
}
