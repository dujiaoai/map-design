package com.yunyan.billingapi.application.admin;

import com.yunyan.billingapi.domain.entity.BillingWallet;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.web.dto.AdminWalletDto;
import com.yunyan.billingapi.web.dto.AdminWalletListResponse;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AdminBillingWalletService {

  private static final int MAX_PAGE_SIZE = 100;

  private final BillingWalletMapper walletMapper;

  public AdminBillingWalletService(BillingWalletMapper walletMapper) {
    this.walletMapper = walletMapper;
  }

  public AdminWalletListResponse listWallets(
      UUID tenantId, UUID userId, int page, int size) {
    var safePage = Math.max(page, 0);
    var safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    var offset = safePage * safeSize;

    var wallets = walletMapper.findWallets(tenantId, userId, safeSize, offset);
    var total = walletMapper.countWallets(tenantId, userId);
    var items = wallets.stream().map(this::toDto).toList();
    return new AdminWalletListResponse(items, safePage, safeSize, total);
  }

  private AdminWalletDto toDto(BillingWallet wallet) {
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0L;
    return new AdminWalletDto(
        wallet.getId(), wallet.getTenantId(), wallet.getUserId(), balance, frozen, balance - frozen);
  }
}
