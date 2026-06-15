package com.yunyan.billingapi.application.coupon;

import com.yunyan.billingapi.domain.entity.BillingCoupon;
import com.yunyan.billingapi.domain.entity.BillingLedger;
import com.yunyan.billingapi.domain.entity.BillingRechargeOrder;
import com.yunyan.billingapi.domain.mapper.BillingCouponMapper;
import com.yunyan.billingapi.domain.mapper.BillingCouponRedemptionMapper;
import com.yunyan.billingapi.domain.mapper.BillingLedgerMapper;
import com.yunyan.billingapi.domain.mapper.BillingWalletMapper;
import com.yunyan.billingapi.application.wallet.WalletService;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import com.yunyan.billingapi.web.dto.RedeemCouponRequest;
import com.yunyan.billingapi.web.dto.RedeemCouponResponse;
import java.time.Instant;
import java.util.UUID;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class BillingCouponService {

  public static final String STATUS_ACTIVE = "active";
  public static final String KIND_GIFT = "gift";
  public static final String KIND_DISCOUNT = "discount";

  public record RechargeDiscountQuote(String code, long discountCents) {}

  private final BillingCouponMapper couponMapper;
  private final BillingCouponRedemptionMapper redemptionMapper;
  private final WalletService walletService;
  private final BillingWalletMapper walletMapper;
  private final BillingLedgerMapper ledgerMapper;

  public BillingCouponService(
      BillingCouponMapper couponMapper,
      BillingCouponRedemptionMapper redemptionMapper,
      WalletService walletService,
      BillingWalletMapper walletMapper,
      BillingLedgerMapper ledgerMapper) {
    this.couponMapper = couponMapper;
    this.redemptionMapper = redemptionMapper;
    this.walletService = walletService;
    this.walletMapper = walletMapper;
    this.ledgerMapper = ledgerMapper;
  }

  @Transactional
  public RedeemCouponResponse redeem(SaasPrincipal principal, RedeemCouponRequest request) {
    var code = normalizeCode(request.code());
    var coupon = couponMapper.findByCode(code);
    if (coupon == null) {
      throw AuthException.notFound("Coupon not found");
    }

    if (KIND_DISCOUNT.equals(resolveKind(coupon.getKind()))) {
      throw AuthException.badRequest("Discount coupons must be applied during recharge checkout");
    }

    validateCouponRedeemable(coupon, principal);

    var dedupeKey = redemptionDedupeKey(code, principal.tenantId(), principal.userId());
    var existing = redemptionMapper.findByDedupeKey(dedupeKey);
    if (existing != null) {
      var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
      return new RedeemCouponResponse(
          code,
          existing.getPoints(),
          wallet.getBalance() != null ? wallet.getBalance() : 0L,
          true);
    }

    if (coupon.getMaxPerUser() != null && coupon.getMaxPerUser() > 0) {
      var userCount =
          redemptionMapper.countForUser(
              coupon.getId(), principal.tenantId(), principal.userId());
      if (userCount >= coupon.getMaxPerUser()) {
        throw AuthException.badRequest("Coupon redemption limit reached for this user");
      }
    }

    var points = coupon.getPoints();
    var wallet = walletService.getOrCreateWallet(principal.tenantId(), principal.userId());

    var redemption = new com.yunyan.billingapi.domain.entity.BillingCouponRedemption();
    redemption.setId(UUID.randomUUID());
    redemption.setCouponId(coupon.getId());
    redemption.setTenantId(principal.tenantId());
    redemption.setUserId(principal.userId());
    redemption.setPoints(points);
    redemption.setDedupeKey(dedupeKey);
    redemption.setCreatedAt(Instant.now());

    try {
      redemptionMapper.insert(redemption);
    } catch (DuplicateKeyException ex) {
      var replay = redemptionMapper.findByDedupeKey(dedupeKey);
      if (replay == null) {
        throw ex;
      }
      var replayWallet =
          walletService.getOrCreateWallet(principal.tenantId(), principal.userId());
      return new RedeemCouponResponse(
          code,
          replay.getPoints(),
          replayWallet.getBalance() != null ? replayWallet.getBalance() : 0L,
          true);
    }

    if (couponMapper.incrementRedemption(coupon.getId(), Instant.now()) != 1) {
      throw AuthException.badRequest("Coupon is no longer available");
    }

    var currentBalance = wallet.getBalance() != null ? wallet.getBalance() : 0L;
    var newBalance = currentBalance + points;
    var updated =
        walletMapper.updateBalance(
            wallet.getId(), newBalance, wallet.getVersion(), Instant.now());
    if (updated != 1) {
      throw AuthException.conflict("Concurrent wallet update during coupon redemption");
    }

    var ledger = new BillingLedger();
    ledger.setId(UUID.randomUUID());
    ledger.setWalletId(wallet.getId());
    ledger.setTenantId(principal.tenantId());
    ledger.setEntryType("coupon");
    ledger.setAmount(points);
    ledger.setBalanceAfter(newBalance);
    ledger.setProductCode("map-workspace");
    ledger.setRemark("coupon:" + code);
    ledger.setIdempotencyKey("coupon-ledger:" + dedupeKey);
    ledger.setCreatedAt(Instant.now());
    ledgerMapper.insert(ledger);

    return new RedeemCouponResponse(code, points, newBalance, false);
  }

  public RechargeDiscountQuote resolveRechargeDiscount(
      SaasPrincipal principal, String rawCode, long listPriceCents) {
    var code = normalizeCode(rawCode);
    var coupon = couponMapper.findByCode(code);
    if (coupon == null) {
      throw AuthException.notFound("Coupon not found");
    }
    if (!KIND_DISCOUNT.equals(resolveKind(coupon.getKind()))) {
      throw AuthException.badRequest("Coupon is not valid for recharge checkout");
    }

    validateCouponRedeemable(coupon, principal);
    assertUserRedemptionAvailable(coupon, principal);

    var discountCents = coupon.getDiscountCents() != null ? coupon.getDiscountCents() : 0L;
    if (discountCents <= 0) {
      throw AuthException.badRequest("Coupon discount is invalid");
    }
    var appliedDiscount = Math.min(discountCents, Math.max(listPriceCents, 0L));
    return new RechargeDiscountQuote(code, appliedDiscount);
  }

  @Transactional
  public void recordRechargeDiscountRedemption(BillingRechargeOrder order) {
    if (!StringUtils.hasText(order.getCouponCode())) {
      return;
    }

    var code = normalizeCode(order.getCouponCode());
    var coupon = couponMapper.findByCode(code);
    if (coupon == null) {
      throw AuthException.notFound("Coupon not found");
    }

    var dedupeKey = rechargeCouponDedupeKey(order.getOrderNo());
    if (redemptionMapper.findByDedupeKey(dedupeKey) != null) {
      return;
    }

    var discountCents =
        order.getCouponDiscountCents() != null ? order.getCouponDiscountCents() : 0L;
    var redemption = new com.yunyan.billingapi.domain.entity.BillingCouponRedemption();
    redemption.setId(UUID.randomUUID());
    redemption.setCouponId(coupon.getId());
    redemption.setTenantId(order.getTenantId());
    redemption.setUserId(order.getUserId());
    redemption.setPoints(discountCents);
    redemption.setDedupeKey(dedupeKey);
    redemption.setCreatedAt(Instant.now());
    redemptionMapper.insert(redemption);

    if (couponMapper.incrementRedemption(coupon.getId(), Instant.now()) != 1) {
      throw AuthException.badRequest("Coupon is no longer available");
    }
  }

  static void validateCouponRedeemable(BillingCoupon coupon, SaasPrincipal principal) {
    if (!STATUS_ACTIVE.equals(coupon.getStatus())) {
      throw AuthException.badRequest("Coupon is inactive");
    }
    if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(Instant.now())) {
      throw AuthException.badRequest("Coupon has expired");
    }
    if (coupon.getMaxTotalRedemptions() != null
        && coupon.getRedemptionCount() != null
        && coupon.getRedemptionCount() >= coupon.getMaxTotalRedemptions()) {
      throw AuthException.badRequest("Coupon redemption limit reached");
    }
  }

  public static String normalizeCode(String code) {
    if (!StringUtils.hasText(code)) {
      throw AuthException.badRequest("Coupon code is required");
    }
    return code.trim().toUpperCase();
  }

  static String redemptionDedupeKey(String code, UUID tenantId, UUID userId) {
    return "coupon:" + code + ":" + tenantId + ":" + userId;
  }

  static String rechargeCouponDedupeKey(String orderNo) {
    return "recharge-coupon:" + orderNo;
  }

  public static String resolveKind(String kind) {
    return StringUtils.hasText(kind) ? kind.trim() : KIND_GIFT;
  }

  private void assertUserRedemptionAvailable(BillingCoupon coupon, SaasPrincipal principal) {
    if (coupon.getMaxPerUser() != null && coupon.getMaxPerUser() > 0) {
      var userCount =
          redemptionMapper.countForUser(
              coupon.getId(), principal.tenantId(), principal.userId());
      if (userCount >= coupon.getMaxPerUser()) {
        throw AuthException.badRequest("Coupon redemption limit reached for this user");
      }
    }
  }
}
