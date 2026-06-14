package com.yunyan.billingapi.application.wallet;

import com.yunyan.billingapi.domain.entity.BillingWallet;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletService {

  private final BillingWalletMapper walletMapper;

  public WalletService(BillingWalletMapper walletMapper) {
    this.walletMapper = walletMapper;
  }

  @Transactional
  public BillingWallet getOrCreateWallet(UUID tenantId, UUID userId) {
    var existing = walletMapper.selectByTenantAndUser(tenantId, userId);
    if (existing != null) {
      return existing;
    }

    var now = Instant.now();
    var wallet = new BillingWallet();
    wallet.setId(UUID.randomUUID());
    wallet.setTenantId(tenantId);
    wallet.setUserId(userId);
    wallet.setBalance(0L);
    wallet.setFrozenBalance(0L);
    wallet.setVersion(0);
    wallet.setCreatedAt(now);
    wallet.setUpdatedAt(now);
    walletMapper.insert(wallet);
    return wallet;
  }
}
