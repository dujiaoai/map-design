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
  public static final String ACTION_BILLING_PACKAGE_WRITE = "billing.package.write";
  public static final String ACTION_BILLING_REFUND = "billing.recharge.refund";
  public static final String ACTION_BILLING_COUPON_WRITE = "billing.coupon.write";
  public static final String ACTION_BILLING_INVOICE_ISSUE = "billing.invoice.issue";
  public static final String ACTION_BILLING_INVOICE_REJECT = "billing.invoice.reject";
  public static final String ACTION_BILLING_WIRE_TRANSFER_APPROVE = "billing.wire_transfer.approve";
  public static final String ACTION_BILLING_WIRE_TRANSFER_REJECT = "billing.wire_transfer.reject";
  private static final String RESOURCE_TYPE_BILLING_WALLET = "billing_wallet";
  private static final String RESOURCE_TYPE_BILLING_PACKAGE = "billing_package";
  private static final String RESOURCE_TYPE_BILLING_ORDER = "billing_recharge_order";
  private static final String RESOURCE_TYPE_BILLING_COUPON = "billing_coupon";
  private static final String RESOURCE_TYPE_BILLING_INVOICE = "billing_invoice";
  private static final String RESOURCE_TYPE_BILLING_WIRE_TRANSFER = "billing_wire_transfer";
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

  public void recordBillingPackageWrite(
      SaasPrincipal actor, UUID packageId, String code, String detail) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_PACKAGE_WRITE);
    log.setResourceType(RESOURCE_TYPE_BILLING_PACKAGE);
    log.setResourceId(packageId == null ? code : packageId.toString());
    log.setTargetTenantId(null);
    log.setCrossTenant(false);
    log.setDetail(truncateDetail("code=" + code + " " + detail));
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingRefund(
      SaasPrincipal actor,
      UUID targetTenantId,
      UUID targetUserId,
      String orderNo,
      long points,
      long balanceAfter,
      String reason,
      String providerRefundNo) {
    if (actor == null) {
      return;
    }

    var detail =
        truncateDetail(
            "orderNo="
                + orderNo
                + " points="
                + points
                + " balanceAfter="
                + balanceAfter
                + " userId="
                + targetUserId
                + " providerRefundNo="
                + providerRefundNo
                + " reason="
                + reason);

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_REFUND);
    log.setResourceType(RESOURCE_TYPE_BILLING_ORDER);
    log.setResourceId(orderNo);
    log.setTargetTenantId(targetTenantId);
    log.setCrossTenant(isCrossTenant(actor, targetTenantId));
    log.setDetail(detail);
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingCouponWrite(
      SaasPrincipal actor, UUID couponId, String code, String detail) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_COUPON_WRITE);
    log.setResourceType(RESOURCE_TYPE_BILLING_COUPON);
    log.setResourceId(couponId == null ? code : couponId.toString());
    log.setTargetTenantId(null);
    log.setCrossTenant(false);
    log.setDetail(truncateDetail("code=" + code + " " + detail));
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingInvoiceIssue(
      SaasPrincipal actor,
      UUID tenantId,
      UUID userId,
      UUID invoiceId,
      String orderNo,
      String pdfUrl) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_INVOICE_ISSUE);
    log.setResourceType(RESOURCE_TYPE_BILLING_INVOICE);
    log.setResourceId(invoiceId.toString());
    log.setTargetTenantId(tenantId);
    log.setCrossTenant(isCrossTenant(actor, tenantId));
    log.setDetail(
        truncateDetail("orderNo=" + orderNo + " userId=" + userId + " pdfUrl=" + pdfUrl));
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingInvoiceReject(
      SaasPrincipal actor,
      UUID tenantId,
      UUID userId,
      UUID invoiceId,
      String orderNo,
      String reason) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_INVOICE_REJECT);
    log.setResourceType(RESOURCE_TYPE_BILLING_INVOICE);
    log.setResourceId(invoiceId.toString());
    log.setTargetTenantId(tenantId);
    log.setCrossTenant(isCrossTenant(actor, tenantId));
    log.setDetail(truncateDetail("orderNo=" + orderNo + " userId=" + userId + " reason=" + reason));
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingWireTransferApprove(
      SaasPrincipal actor,
      UUID tenantId,
      UUID userId,
      UUID requestId,
      String requestNo,
      long points,
      long balanceAfter) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_WIRE_TRANSFER_APPROVE);
    log.setResourceType(RESOURCE_TYPE_BILLING_WIRE_TRANSFER);
    log.setResourceId(requestId.toString());
    log.setTargetTenantId(tenantId);
    log.setCrossTenant(isCrossTenant(actor, tenantId));
    log.setDetail(
        truncateDetail(
            "requestNo="
                + requestNo
                + " points="
                + points
                + " balanceAfter="
                + balanceAfter
                + " userId="
                + userId));
    log.setCreatedAt(Instant.now());
    auditLogMapper.insert(log);
  }

  public void recordBillingWireTransferReject(
      SaasPrincipal actor,
      UUID tenantId,
      UUID userId,
      UUID requestId,
      String requestNo,
      String reason) {
    if (actor == null) {
      return;
    }

    var log = new SysAdminAuditLog();
    log.setId(UUID.randomUUID());
    log.setActorUserId(actor.userId());
    log.setActorEmail(actor.getUsername());
    log.setActorTenantId(actor.tenantId());
    log.setAction(ACTION_BILLING_WIRE_TRANSFER_REJECT);
    log.setResourceType(RESOURCE_TYPE_BILLING_WIRE_TRANSFER);
    log.setResourceId(requestId.toString());
    log.setTargetTenantId(tenantId);
    log.setCrossTenant(isCrossTenant(actor, tenantId));
    log.setDetail(
        truncateDetail("requestNo=" + requestNo + " userId=" + userId + " reason=" + reason));
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
