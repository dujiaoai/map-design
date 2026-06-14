package com.yunyan.billingapi.application.ledger;

import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.LedgerEntryDto;
import com.yunyan.billingapi.web.dto.LedgerListResponse;
import org.springframework.stereotype.Service;

@Service
public class LedgerService {

  private static final int DEFAULT_SIZE = 20;
  private static final int MAX_SIZE = 100;

  private final WalletService walletService;
  private final BillingLedgerMapper ledgerMapper;

  public LedgerService(WalletService walletService, BillingLedgerMapper ledgerMapper) {
    this.walletService = walletService;
    this.ledgerMapper = ledgerMapper;
  }

  public LedgerListResponse listMyLedger(SaasPrincipal principal, int page, int size) {
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
    var offset = safePage * safeSize;

    var entries =
        ledgerMapper.findByWalletId(wallet.getId(), safeSize, offset).stream()
            .map(this::toDto)
            .toList();
    var total = ledgerMapper.countByWalletId(wallet.getId());

    return new LedgerListResponse(entries, safePage, safeSize, total);
  }

  private LedgerEntryDto toDto(com.yunyan.billingapi.domain.entity.BillingLedger ledger) {
    return new LedgerEntryDto(
        ledger.getId(),
        ledger.getEntryType(),
        ledger.getAmount() != null ? ledger.getAmount() : 0L,
        ledger.getBalanceAfter() != null ? ledger.getBalanceAfter() : 0L,
        ledger.getProductCode(),
        ledger.getRemark(),
        ledger.getCreatedAt());
  }
}
