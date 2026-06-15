package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.tenant.TenantMembershipService;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminAdjustRecordDto;
import com.yunyan.billingapi.web.dto.AdminAdjustRecordListResponse;
import com.yunyan.billingapi.web.dto.AdminAdjustRequest;
import com.yunyan.billingapi.web.dto.AdminAdjustResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBillingAdjustService {

  private static final String PRODUCT_CODE = "platform-admin";

  private final WalletService walletService;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final AdminAuditLogService adminAuditLogService;
  private final TenantMembershipService tenantMembershipService;
  private final BillingMetrics billingMetrics;

  public AdminBillingAdjustService(
      WalletService walletService,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      AdminAuditLogService adminAuditLogService,
      TenantMembershipService tenantMembershipService,
      BillingMetrics billingMetrics) {
    this.walletService = walletService;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.adminAuditLogService = adminAuditLogService;
    this.tenantMembershipService = tenantMembershipService;
    this.billingMetrics = billingMetrics;
  }

  @Transactional
  public AdminAdjustResponse adjust(
      SaasPrincipal actor, UUID tenantId, AdminAdjustRequest request) {
    tenantMembershipService.requireTenantMember(tenantId, request.userId());
    var idempotencyKey = request.idempotencyKey().trim();
    var existing = ledgerMapper.findByIdempotencyKey(idempotencyKey);
    if (existing != null) {
      return toReplayResponse(existing);
    }

    if (request.amount() == 0) {
      throw AuthException.badRequest("Adjust amount must not be zero");
    }

    var remark = request.remark().trim();
    if (!StringUtils.hasText(remark)) {
      throw AuthException.badRequest("Remark is required");
    }

    var wallet = walletService.getOrCreateWallet(tenantId, request.userId());
    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + request.amount();
    if (newBalance < 0) {
      throw AuthException.conflict("Adjust would make wallet balance negative");
    }

    var updated =
        walletMapper.updateBalance(
            wallet.getId(), newBalance, wallet.getVersion(), Instant.now());
    if (updated != 1) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }

    var ledger = new BillingLedger();
    ledger.setId(UUID.randomUUID());
    ledger.setWalletId(wallet.getId());
    ledger.setTenantId(tenantId);
    ledger.setEntryType("adjust");
    ledger.setAmount(request.amount());
    ledger.setBalanceAfter(newBalance);
    ledger.setProductCode(PRODUCT_CODE);
    ledger.setRemark(remark);
    ledger.setIdempotencyKey(idempotencyKey);
    ledger.setCreatedAt(Instant.now());
    ledgerMapper.insert(ledger);

    adminAuditLogService.recordBillingAdjust(
        actor,
        tenantId,
        request.userId(),
        wallet.getId(),
        request.amount(),
        newBalance,
        remark,
        idempotencyKey);

    billingMetrics.recordAdjustApplied();

    return AdminAdjustResponse.applied(
        wallet.getId(), tenantId, request.userId(), request.amount(), newBalance, remark);
  }

  private AdminAdjustResponse toReplayResponse(BillingLedger ledger) {
    var wallet = walletMapper.selectById(ledger.getWalletId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }
    var balanceAfter =
        wallet.getBalance() != null ? wallet.getBalance() : ledger.getBalanceAfter();
    return AdminAdjustResponse.replay(
        wallet.getId(),
        wallet.getTenantId(),
        wallet.getUserId(),
        ledger.getAmount(),
        balanceAfter,
        ledger.getRemark());
  }

  public AdminAdjustRecordListResponse listAdjustRecords(
      UUID tenantId, UUID userId, int page, int size) {
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), 100);
    var offset = safePage * safeSize;

    var rows = ledgerMapper.findAdminAdjustRecords(tenantId, userId, safeSize, offset);
    var total = ledgerMapper.countAdminAdjustRecords(tenantId, userId);
    var items =
        rows.stream()
            .map(
                row ->
                    new AdminAdjustRecordDto(
                        row.getId(),
                        row.getWalletId(),
                        row.getTenantId(),
                        row.getUserId(),
                        row.getAmount() != null ? row.getAmount() : 0L,
                        row.getBalanceAfter() != null ? row.getBalanceAfter() : 0L,
                        row.getRemark(),
                        row.getIdempotencyKey(),
                        row.getCreatedAt()))
            .toList();
    return new AdminAdjustRecordListResponse(items, safePage, safeSize, total);
  }
}
