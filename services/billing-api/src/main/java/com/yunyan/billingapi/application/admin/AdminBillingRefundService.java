package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.application.payment.PaymentGatewayRegistry;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminRefundRequest;
import com.yunyan.billingapi.web.dto.AdminRefundResponse;
import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingRefundService {

  private static final String PRODUCT_CODE = "platform-admin";

  private final BillingRechargeOrderMapper orderMapper;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final PaymentGatewayRegistry paymentGatewayRegistry;
  private final AdminAuditLogService adminAuditLogService;

  public AdminBillingRefundService(
      BillingRechargeOrderMapper orderMapper,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      PaymentGatewayRegistry paymentGatewayRegistry,
      AdminAuditLogService adminAuditLogService) {
    this.orderMapper = orderMapper;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.paymentGatewayRegistry = paymentGatewayRegistry;
    this.adminAuditLogService = adminAuditLogService;
  }

  @Transactional
  public AdminRefundResponse refundOrder(
      SaasPrincipal actor, String orderNo, AdminRefundRequest request) {
    var normalizedOrderNo = orderNo.trim();
    var idempotencyKey = ledgerIdempotencyKey(request.idempotencyKey());
    var existingLedger = ledgerMapper.findByIdempotencyKey(idempotencyKey);
    if (existingLedger != null) {
      return toReplayResponse(normalizedOrderNo, existingLedger, request.reason().trim());
    }

    var order = orderMapper.findByOrderNo(normalizedOrderNo);
    if (order == null) {
      throw AuthException.notFound("Recharge order not found");
    }
    if ("refunded".equals(order.getStatus())) {
      throw AuthException.conflict("Order already refunded");
    }
    if (!"paid".equals(order.getStatus())) {
      throw AuthException.conflict("Only paid orders can be refunded");
    }

    var reason = request.reason().trim();
    if (!StringUtils.hasText(reason)) {
      throw AuthException.badRequest("Reason is required");
    }

    var wallet = walletMapper.selectById(order.getWalletId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    var points = order.getPoints() != null ? order.getPoints() : 0L;
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    if (balance < points) {
      throw AuthException.conflict("Insufficient wallet balance for refund");
    }

    var now = Instant.now();
    if (orderMapper.markRefunding(order.getId(), now) != 1) {
      throw AuthException.conflict("Order refund already in progress");
    }

    var refundResult =
        paymentGatewayRegistry
            .require(order.getChannel())
            .refund(
                normalizedOrderNo,
                order.getPriceCents() != null ? order.getPriceCents() : 0L,
                order.getCurrency(),
                order.getProviderTradeNo());

    if (refundResult.async()) {
      throw AuthException.conflict("Async refund is not supported yet");
    }

    var newBalance = balance - points;
    if (walletMapper.updateBalance(wallet.getId(), newBalance, wallet.getVersion(), now) != 1) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }

    var ledger = new BillingLedger();
    ledger.setId(java.util.UUID.randomUUID());
    ledger.setWalletId(wallet.getId());
    ledger.setTenantId(order.getTenantId());
    ledger.setEntryType("refund");
    ledger.setAmount(-points);
    ledger.setBalanceAfter(newBalance);
    ledger.setProductCode(PRODUCT_CODE);
    ledger.setRemark("refund:" + normalizedOrderNo + " " + reason);
    ledger.setIdempotencyKey(idempotencyKey);
    ledger.setCreatedAt(now);
    ledgerMapper.insert(ledger);

    if (orderMapper.markRefunded(order.getId(), now) != 1) {
      throw AuthException.conflict("Order refund state conflict");
    }

    adminAuditLogService.recordBillingRefund(
        actor,
        order.getTenantId(),
        order.getUserId(),
        normalizedOrderNo,
        points,
        newBalance,
        reason,
        refundResult.providerRefundNo());

    return AdminRefundResponse.applied(
        normalizedOrderNo,
        order.getTenantId(),
        order.getUserId(),
        "refunded",
        points,
        newBalance,
        reason);
  }

  private AdminRefundResponse toReplayResponse(
      String orderNo, BillingLedger ledger, String reason) {
    var wallet = walletMapper.selectById(ledger.getWalletId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }
    var balanceAfter =
        wallet.getBalance() != null ? wallet.getBalance() : ledger.getBalanceAfter();
    return AdminRefundResponse.replay(
        orderNo,
        wallet.getTenantId(),
        wallet.getUserId(),
        "refunded",
        Math.abs(ledger.getAmount()),
        balanceAfter,
        reason);
  }

  private static String ledgerIdempotencyKey(String key) {
    return "refund:" + key.trim();
  }
}
