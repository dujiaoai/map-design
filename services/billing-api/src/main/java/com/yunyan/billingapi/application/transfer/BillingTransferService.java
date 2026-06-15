package com.yunyan.billingapi.application.transfer;

import com.yunyan.billingapi.application.hold.InsufficientBalanceException;
import com.yunyan.billingapi.application.tenant.TenantMembershipService;
import com.yunyan.billingapi.application.wallet.LowBalanceMonitor;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.TransferRequest;
import com.yunyan.billingapi.web.dto.TransferResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BillingTransferService {

  private static final String PRODUCT_CODE = "billing";

  private final WalletService walletService;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final TenantMembershipService tenantMembershipService;
  private final LowBalanceMonitor lowBalanceMonitor;

  public BillingTransferService(
      WalletService walletService,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      TenantMembershipService tenantMembershipService,
      LowBalanceMonitor lowBalanceMonitor) {
    this.walletService = walletService;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.tenantMembershipService = tenantMembershipService;
    this.lowBalanceMonitor = lowBalanceMonitor;
  }

  @Transactional
  public TransferResponse transfer(SaasPrincipal actor, TransferRequest request) {
    var tenantId = actor.tenantId();
    var debitKey = debitIdempotencyKey(request.idempotencyKey());
    var existingDebit = ledgerMapper.findByIdempotencyKey(debitKey);
    if (existingDebit != null) {
      return toReplayResponse(existingDebit, request);
    }

    if (actor.userId().equals(request.toUserId())) {
      throw AuthException.badRequest("Cannot transfer to yourself");
    }

    tenantMembershipService.requireTenantMember(tenantId, request.toUserId());

    var amount = request.amount();
    var remark = normalizeRemark(request.remark(), request.toUserId());

    var fromWallet = walletService.getOrCreateWallet(tenantId, actor.userId());
    var toWallet = walletService.getOrCreateWallet(tenantId, request.toUserId());

    var fromBalance = fromWallet.getBalance() != null ? fromWallet.getBalance() : 0L;
    var fromFrozen = fromWallet.getFrozenBalance() != null ? fromWallet.getFrozenBalance() : 0L;
    var available = fromBalance - fromFrozen;
    if (available < amount) {
      throw new InsufficientBalanceException(Math.max(available, 0L), amount);
    }

    var fromBalanceAfter = fromBalance - amount;
    var toBalance = toWallet.getBalance() != null ? toWallet.getBalance() : 0L;
    var toBalanceAfter = toBalance + amount;
    var now = Instant.now();

    if (walletMapper.updateBalance(fromWallet.getId(), fromBalanceAfter, fromWallet.getVersion(), now)
        != 1) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }
    if (walletMapper.updateBalance(toWallet.getId(), toBalanceAfter, toWallet.getVersion(), now) != 1) {
      throw AuthException.conflict("Wallet update conflict, retry");
    }

    lowBalanceMonitor.checkAvailableCrossing(available, fromBalanceAfter - fromFrozen);

    insertLedger(
        fromWallet.getId(),
        tenantId,
        "transfer_out",
        -amount,
        fromBalanceAfter,
        remark,
        debitKey,
        now);
    insertLedger(
        toWallet.getId(),
        tenantId,
        "transfer_in",
        amount,
        toBalanceAfter,
        remark,
        creditIdempotencyKey(request.idempotencyKey()),
        now);

    return TransferResponse.applied(
        fromWallet.getId(),
        toWallet.getId(),
        actor.userId(),
        request.toUserId(),
        amount,
        fromBalanceAfter,
        toBalanceAfter,
        remark);
  }

  private TransferResponse toReplayResponse(BillingLedger debitLedger, TransferRequest request) {
    var creditLedger = ledgerMapper.findByIdempotencyKey(creditIdempotencyKey(request.idempotencyKey()));
    if (creditLedger == null) {
      throw AuthException.conflict("Transfer idempotency key partially applied");
    }

    var fromWallet = walletMapper.selectById(debitLedger.getWalletId());
    var toWallet = walletMapper.selectById(creditLedger.getWalletId());
    if (fromWallet == null || toWallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    return TransferResponse.replay(
        fromWallet.getId(),
        toWallet.getId(),
        fromWallet.getUserId(),
        toWallet.getUserId(),
        creditLedger.getAmount(),
        fromWallet.getBalance() != null ? fromWallet.getBalance() : debitLedger.getBalanceAfter(),
        toWallet.getBalance() != null ? toWallet.getBalance() : creditLedger.getBalanceAfter(),
        debitLedger.getRemark());
  }

  private void insertLedger(
      UUID walletId,
      UUID tenantId,
      String entryType,
      long amount,
      long balanceAfter,
      String remark,
      String idempotencyKey,
      Instant createdAt) {
    var ledger = new BillingLedger();
    ledger.setId(UUID.randomUUID());
    ledger.setWalletId(walletId);
    ledger.setTenantId(tenantId);
    ledger.setEntryType(entryType);
    ledger.setAmount(amount);
    ledger.setBalanceAfter(balanceAfter);
    ledger.setProductCode(PRODUCT_CODE);
    ledger.setRemark(remark);
    ledger.setIdempotencyKey(idempotencyKey);
    ledger.setCreatedAt(createdAt);
    ledgerMapper.insert(ledger);
  }

  private static String normalizeRemark(String remark, UUID toUserId) {
    if (StringUtils.hasText(remark)) {
      return remark.trim();
    }
    return "transfer to " + toUserId;
  }

  private static String debitIdempotencyKey(String key) {
    return "transfer:" + key.trim() + ":debit";
  }

  private static String creditIdempotencyKey(String key) {
    return "transfer:" + key.trim() + ":credit";
  }
}
