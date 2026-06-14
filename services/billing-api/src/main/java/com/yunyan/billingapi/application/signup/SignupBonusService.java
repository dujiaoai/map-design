package com.yunyan.billingapi.application.signup;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.web.dto.SignupBonusResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SignupBonusService {

  public static final String TENANT_KIND_PERSONAL = "personal";
  public static final String TENANT_KIND_ORGANIZATION = "organization";

  private final BillingAppProperties billingAppProperties;
  private final WalletService walletService;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;

  public SignupBonusService(
      BillingAppProperties billingAppProperties,
      WalletService walletService,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper) {
    this.billingAppProperties = billingAppProperties;
    this.walletService = walletService;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
  }

  @Transactional
  public SignupBonusResponse grantSignupBonus(UUID tenantId, UUID userId, String tenantKind) {
    var normalizedKind =
        TENANT_KIND_PERSONAL.equals(tenantKind) ? TENANT_KIND_PERSONAL : TENANT_KIND_ORGANIZATION;
    var idempotencyKey = resolveIdempotencyKey(tenantId, userId, normalizedKind);

    if (ledgerMapper.existsByIdempotencyKey(idempotencyKey)) {
      var wallet = walletService.getOrCreateWallet(tenantId, userId);
      return SignupBonusResponse.alreadyGranted(wallet.getId(), wallet.getBalance());
    }

    if (TENANT_KIND_ORGANIZATION.equals(normalizedKind)
        && ledgerMapper.existsSignupBonusForTenant(tenantId)) {
      var wallet = walletService.getOrCreateWallet(tenantId, userId);
      return SignupBonusResponse.alreadyGranted(wallet.getId(), wallet.getBalance());
    }

    var points =
        TENANT_KIND_PERSONAL.equals(normalizedKind)
            ? billingAppProperties.getSignupBonus().getPersonal()
            : billingAppProperties.getSignupBonus().getOrganization();

    var wallet = walletService.getOrCreateWallet(tenantId, userId);
    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + points;
    var updated =
        walletMapper.updateBalance(
            wallet.getId(), newBalance, wallet.getVersion(), Instant.now());
    if (updated != 1) {
      throw new IllegalStateException("Concurrent wallet update during signup bonus");
    }

    var ledger = new BillingLedger();
    ledger.setId(UUID.randomUUID());
    ledger.setWalletId(wallet.getId());
    ledger.setTenantId(tenantId);
    ledger.setEntryType("adjust");
    ledger.setAmount(points);
    ledger.setBalanceAfter(newBalance);
    ledger.setProductCode("map-workspace");
    ledger.setRemark("signup_bonus");
    ledger.setIdempotencyKey(idempotencyKey);
    ledger.setCreatedAt(Instant.now());
    ledgerMapper.insert(ledger);

    return SignupBonusResponse.granted(wallet.getId(), points, newBalance);
  }

  static String resolveIdempotencyKey(UUID tenantId, UUID userId, String tenantKind) {
    if (TENANT_KIND_ORGANIZATION.equals(tenantKind)) {
      return "signup-bonus:org:" + tenantId;
    }
    return "signup-bonus:" + tenantId + ":" + userId;
  }
}
