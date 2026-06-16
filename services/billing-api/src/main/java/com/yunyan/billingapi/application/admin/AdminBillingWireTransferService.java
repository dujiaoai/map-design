package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.application.tenant.TenantMembershipService;
import com.yunyan.billingapi.application.wallet.LowBalanceMonitor;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.application.wiretransfer.BillingWireTransferService;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.domain.mapper.BillingWireTransferMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.AdminRejectInvoiceRequest;
import com.yunyan.billingapi.web.dto.ApproveWireTransferResponse;
import com.yunyan.billingapi.web.dto.WireTransferRequestDto;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminBillingWireTransferService {

  private static final String PRODUCT_CODE = "platform-admin";

  private final BillingWireTransferMapper wireTransferMapper;
  private final WalletService walletService;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final AdminAuditLogService adminAuditLogService;
  private final TenantMembershipService tenantMembershipService;

  public AdminBillingWireTransferService(
      BillingWireTransferMapper wireTransferMapper,
      WalletService walletService,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      AdminAuditLogService adminAuditLogService,
      TenantMembershipService tenantMembershipService) {
    this.wireTransferMapper = wireTransferMapper;
    this.walletService = walletService;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.adminAuditLogService = adminAuditLogService;
    this.tenantMembershipService = tenantMembershipService;
  }

  @Transactional
  public ApproveWireTransferResponse approve(SaasPrincipal actor, UUID requestId) {
    var request = requirePendingRequest(requestId);
    tenantMembershipService.requireTenantMember(request.getTenantId(), request.getUserId());

    var idempotencyKey = "wire-transfer-credit:" + request.getId();
    var existingLedger = ledgerMapper.findByIdempotencyKey(idempotencyKey);
    if (existingLedger != null) {
      var wallet = walletService.getOrCreateWallet(request.getTenantId(), request.getUserId());
      return new ApproveWireTransferResponse(
          request.getRequestNo(),
          request.getTenantId().toString(),
          request.getUserId().toString(),
          BillingWireTransferService.STATUS_CREDITED,
          request.getPoints(),
          wallet.getBalance() != null ? wallet.getBalance() : 0L);
    }

    var wallet = walletService.getOrCreateWallet(request.getTenantId(), request.getUserId());
    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + request.getPoints();

    var updated =
        walletMapper.updateBalance(
            wallet.getId(), newBalance, wallet.getVersion(), Instant.now());
    if (updated != 1) {
      throw AuthException.conflict("Wallet update conflict during wire transfer credit");
    }

    var ledger = new BillingLedger();
    ledger.setId(UUID.randomUUID());
    ledger.setWalletId(wallet.getId());
    ledger.setTenantId(request.getTenantId());
    ledger.setEntryType("wire_transfer");
    ledger.setAmount(request.getPoints());
    ledger.setBalanceAfter(newBalance);
    ledger.setProductCode(PRODUCT_CODE);
    ledger.setRemark("wire_transfer:" + request.getRequestNo());
    ledger.setIdempotencyKey(idempotencyKey);
    ledger.setCreatedAt(Instant.now());
    ledgerMapper.insert(ledger);

    if (wireTransferMapper.updateStatus(
            request.getId(),
            BillingWireTransferService.STATUS_CREDITED,
            null,
            ledger.getId(),
            Instant.now())
        != 1) {
      throw AuthException.conflict("Wire transfer request status changed concurrently");
    }

    adminAuditLogService.recordBillingWireTransferApprove(
        actor,
        request.getTenantId(),
        request.getUserId(),
        request.getId(),
        request.getRequestNo(),
        request.getPoints(),
        newBalance);

    return new ApproveWireTransferResponse(
        request.getRequestNo(),
        request.getTenantId().toString(),
        request.getUserId().toString(),
        BillingWireTransferService.STATUS_CREDITED,
        request.getPoints(),
        newBalance);
  }

  @Transactional
  public WireTransferRequestDto reject(
      SaasPrincipal actor, UUID requestId, AdminRejectInvoiceRequest request) {
    var existing = requirePendingRequest(requestId);
    if (wireTransferMapper.updateStatus(
            requestId,
            BillingWireTransferService.STATUS_REJECTED,
            request.reason().trim(),
            null,
            Instant.now())
        != 1) {
      throw AuthException.conflict("Wire transfer request status changed concurrently");
    }
    var refreshed = wireTransferMapper.findById(existing.getId());
    adminAuditLogService.recordBillingWireTransferReject(
        actor,
        existing.getTenantId(),
        existing.getUserId(),
        existing.getId(),
        existing.getRequestNo(),
        request.reason().trim());
    return BillingWireTransferService.toDto(refreshed);
  }

  private com.yunyan.billingapi.domain.entity.BillingWireTransferRequest requirePendingRequest(
      UUID requestId) {
    var request = wireTransferMapper.findById(requestId);
    if (request == null) {
      throw AuthException.notFound("Wire transfer request not found");
    }
    if (!BillingWireTransferService.STATUS_PENDING.equals(request.getStatus())) {
      throw AuthException.badRequest("Wire transfer request is not pending");
    }
    return request;
  }
}
