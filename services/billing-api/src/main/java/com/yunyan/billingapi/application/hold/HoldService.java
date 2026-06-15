package com.yunyan.billingapi.application.hold;

import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.billingapi.application.metrics.BillingMetrics;
import com.yunyan.billingapi.application.wallet.LowBalanceMonitor;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.entity.BillingConsumptionRecord;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.mapper.BillingConsumptionRecordMapper;
import com.yunyan.billingapi.domain.mapper.BillingConsumptionRuleMapper;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.web.dto.HoldResponse;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class HoldService {

  private static final Pattern CODE_PATTERN =
      Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$");

  private final BillingAppProperties billingAppProperties;
  private final WalletService walletService;
  private final BillingConsumptionRuleMapper ruleMapper;
  private final BillingConsumptionRecordMapper recordMapper;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;
  private final BillingMetrics billingMetrics;
  private final LowBalanceMonitor lowBalanceMonitor;

  public HoldService(
      BillingAppProperties billingAppProperties,
      WalletService walletService,
      BillingConsumptionRuleMapper ruleMapper,
      BillingConsumptionRecordMapper recordMapper,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper,
      BillingMetrics billingMetrics,
      LowBalanceMonitor lowBalanceMonitor) {
    this.billingAppProperties = billingAppProperties;
    this.walletService = walletService;
    this.ruleMapper = ruleMapper;
    this.recordMapper = recordMapper;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
    this.billingMetrics = billingMetrics;
    this.lowBalanceMonitor = lowBalanceMonitor;
  }

  public EstimateResult estimate(WalletHoldRequest request) {
    var resolved = resolveRuleAndPoints(request);
    return new EstimateResult(resolved.points(), resolved.rule().getUnitLabel(), request.quantity());
  }

  @Transactional
  public HoldResponse hold(WalletHoldRequest request) {
    validateHoldRequest(request);

    var existing = recordMapper.findByIdempotencyKey(request.idempotencyKey());
    if (existing != null) {
      if ("held".equals(existing.getStatus()) || "confirmed".equals(existing.getStatus())) {
        return new HoldResponse(existing.getId().toString(), existing.getPoints(), existing.getStatus());
      }
      throw AuthException.conflict("Idempotency key reused for failed hold");
    }

    var resolved = resolveRuleAndPoints(request);
    var wallet = walletService.getOrCreateWallet(request.tenantId(), request.userId());
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0L;
    var available = balance - frozen;

    if (available < resolved.points()) {
      throw new InsufficientBalanceException(Math.max(available, 0L), resolved.points());
    }

    var now = Instant.now();
    var newBalance = balance - resolved.points();
    var newFrozen = frozen + resolved.points();
    var updated =
        walletMapper.updateBalances(
            wallet.getId(), newBalance, newFrozen, wallet.getVersion(), now);
    if (updated == 0) {
      throw AuthException.conflict("Wallet update conflict, retry hold");
    }

    lowBalanceMonitor.checkAvailableCrossing(
        LowBalanceMonitor.context(request.tenantId(), request.userId(), wallet.getId()),
        LowBalanceMonitor.available(balance, frozen),
        LowBalanceMonitor.available(newBalance, newFrozen));

    var record = new BillingConsumptionRecord();
    record.setId(UUID.randomUUID());
    record.setTenantId(request.tenantId());
    record.setUserId(request.userId());
    record.setWalletId(wallet.getId());
    record.setProductCode(resolved.rule().getProductCode());
    record.setRuleCode(resolved.rule().getCode());
    record.setQuantity(request.quantity());
    record.setPoints(resolved.points());
    record.setStatus("held");
    record.setBizRef(request.bizRef());
    record.setIdempotencyKey(request.idempotencyKey());
    record.setHoldExpiresAt(now.plusSeconds(billingAppProperties.getHold().getTtlMinutes() * 60L));
    record.setCreatedAt(now);
    record.setUpdatedAt(now);
    recordMapper.insert(record);

    billingMetrics.recordHoldCreated();

    return new HoldResponse(record.getId().toString(), resolved.points(), "held");
  }

  @Transactional
  public void confirm(UUID holdId) {
    var record = requireHeldRecord(holdId);
    var wallet = walletMapper.selectByTenantAndUser(record.getTenantId(), record.getUserId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    var now = Instant.now();
    var frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0L;
    var points = record.getPoints() != null ? record.getPoints() : 0L;
    if (frozen < points) {
      throw AuthException.conflict("Frozen balance insufficient for confirm");
    }

    var updatedFrozen = frozen - points;
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var walletUpdated =
        walletMapper.updateBalances(
            wallet.getId(), balance, updatedFrozen, wallet.getVersion(), now);
    if (walletUpdated == 0) {
      throw AuthException.conflict("Wallet update conflict on confirm");
    }

    var statusUpdated = recordMapper.updateStatus(holdId, "held", "confirmed", now);
    if (statusUpdated == 0) {
      throw AuthException.conflict("Hold already processed");
    }

    var idempotencyKey = "debit:" + holdId;
    if (!ledgerMapper.existsByIdempotencyKey(idempotencyKey)) {
      var ledger = new BillingLedger();
      ledger.setId(UUID.randomUUID());
      ledger.setWalletId(wallet.getId());
      ledger.setTenantId(record.getTenantId());
      ledger.setEntryType("debit");
      ledger.setAmount(points);
      ledger.setBalanceAfter(balance);
      ledger.setProductCode(record.getProductCode());
      ledger.setRemark(record.getBizRef() != null ? record.getBizRef() : record.getRuleCode());
      ledger.setIdempotencyKey(idempotencyKey);
      ledger.setCreatedAt(now);
      ledgerMapper.insert(ledger);
    }

    billingMetrics.recordHoldConfirmed();
  }

  @Transactional
  public void cancel(UUID holdId) {
    cancelHeldRecord(requireHeldRecord(holdId));
  }

  @Transactional
  public int cancelExpiredHolds(int batchSize) {
    var expired = recordMapper.findExpiredHolds(Instant.now(), batchSize);
    var cancelled = 0;
    for (var record : expired) {
      try {
        cancelHeldRecord(record);
        cancelled++;
      } catch (RuntimeException ignored) {
        // concurrent confirm/cancel — skip
      }
    }
    return cancelled;
  }

  private void cancelHeldRecord(BillingConsumptionRecord record) {
    var wallet = walletMapper.selectByTenantAndUser(record.getTenantId(), record.getUserId());
    if (wallet == null) {
      throw AuthException.notFound("Wallet not found");
    }

    var now = Instant.now();
    var balance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var frozen = wallet.getFrozenBalance() != null ? wallet.getFrozenBalance() : 0L;
    var points = record.getPoints() != null ? record.getPoints() : 0L;

    var walletUpdated =
        walletMapper.updateBalances(
            wallet.getId(), balance + points, frozen - points, wallet.getVersion(), now);
    if (walletUpdated == 0) {
      throw AuthException.conflict("Wallet update conflict on cancel");
    }

    var statusUpdated = recordMapper.updateStatus(record.getId(), "held", "cancelled", now);
    if (statusUpdated == 0) {
      throw AuthException.conflict("Hold already processed");
    }
  }

  private BillingConsumptionRecord requireHeldRecord(UUID holdId) {
    var record = recordMapper.findById(holdId);
    if (record == null) {
      throw AuthException.notFound("Hold not found");
    }
    if (!"held".equals(record.getStatus())) {
      throw AuthException.conflict("Hold is not active");
    }
    if (record.getHoldExpiresAt() != null && record.getHoldExpiresAt().isBefore(Instant.now())) {
      throw AuthException.conflict("Hold expired");
    }
    return record;
  }

  private void validateHoldRequest(WalletHoldRequest request) {
    if (request.tenantId() == null || request.userId() == null) {
      throw AuthException.badRequest("tenantId and userId are required");
    }
    if (!StringUtils.hasText(request.productCode()) || !StringUtils.hasText(request.ruleCode())) {
      throw AuthException.badRequest("productCode and ruleCode are required");
    }
    validateCode("productCode", request.productCode());
    validateCode("ruleCode", request.ruleCode());
    if (request.quantity() <= 0) {
      throw AuthException.badRequest("quantity must be positive");
    }
    var holdProps = billingAppProperties.getHold();
    if (request.quantity() > holdProps.getMaxQuantity()) {
      throw AuthException.badRequest(
          "quantity exceeds maximum " + holdProps.getMaxQuantity());
    }
    if (!StringUtils.hasText(request.idempotencyKey())) {
      throw AuthException.badRequest("idempotencyKey is required");
    }
    var idempotencyKey = request.idempotencyKey().trim();
    if (idempotencyKey.length() > holdProps.getIdempotencyKeyMaxLength()) {
      throw AuthException.badRequest("idempotencyKey too long");
    }
    if (StringUtils.hasText(request.bizRef())
        && request.bizRef().length() > holdProps.getBizRefMaxLength()) {
      throw AuthException.badRequest("bizRef too long");
    }
  }

  private void validateCode(String field, String value) {
    var trimmed = value.trim();
    if (!CODE_PATTERN.matcher(trimmed).matches()) {
      throw AuthException.badRequest(field + " has invalid format");
    }
  }

  private ResolvedRule resolveRuleAndPoints(WalletHoldRequest request) {
    if (request.tenantId() == null || request.userId() == null) {
      throw AuthException.badRequest("tenantId and userId are required");
    }
    if (!StringUtils.hasText(request.ruleCode())) {
      throw AuthException.badRequest("ruleCode is required");
    }
    if (request.quantity() <= 0) {
      throw AuthException.badRequest("quantity must be positive");
    }

    var rule = ruleMapper.findActiveByCode(request.ruleCode().trim());
    if (rule == null) {
      throw AuthException.notFound("Consumption rule not found");
    }
    if (StringUtils.hasText(request.productCode())
        && !request.productCode().trim().equals(rule.getProductCode())) {
      throw AuthException.badRequest("productCode does not match rule");
    }

    var pointsPerUnit = rule.getPointsPerUnit() != null ? rule.getPointsPerUnit() : 0L;
    if (pointsPerUnit > 0 && request.quantity() > Long.MAX_VALUE / pointsPerUnit) {
      throw AuthException.badRequest("quantity too large for rule");
    }
    var points = pointsPerUnit * request.quantity();
    if (points <= 0) {
      throw AuthException.badRequest("Computed points must be positive");
    }
    var maxPoints = billingAppProperties.getHold().getMaxPointsPerHold();
    if (points > maxPoints) {
      throw AuthException.badRequest("Computed points exceed maximum per hold");
    }
    return new ResolvedRule(rule, points);
  }

  private record ResolvedRule(
      com.yunyan.billingapi.domain.entity.BillingConsumptionRule rule, long points) {}
}
