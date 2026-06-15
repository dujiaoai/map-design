package com.yunyan.billingapi.application.coupon;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class BillingCouponStackingPolicy {

  private final BillingAppProperties billingAppProperties;
  private final BillingRechargeOrderMapper orderMapper;

  public BillingCouponStackingPolicy(
      BillingAppProperties billingAppProperties, BillingRechargeOrderMapper orderMapper) {
    this.billingAppProperties = billingAppProperties;
    this.orderMapper = orderMapper;
  }

  public void assertRechargeCheckoutAllowed(
      SaasPrincipal principal, List<String> couponCodes, long listPriceCents, long discountCents) {
    assertCouponCountAllowed(couponCodes);
    assertNoConcurrentPendingRechargeCoupon(principal);
    assertMinPayableAfterDiscount(listPriceCents, discountCents);
  }

  void assertCouponCountAllowed(List<String> couponCodes) {
    var configuredMax = Math.max(billingAppProperties.getCoupon().getMaxCouponsPerRecharge(), 1);
    var mode =
        CouponStackingMode.fromConfig(billingAppProperties.getCoupon().getStackingMode());
    var effectiveMax = mode == CouponStackingMode.SINGLE ? 1 : configuredMax;
    var normalized =
        couponCodes.stream().filter(StringUtils::hasText).map(String::trim).distinct().toList();
    if (normalized.size() > effectiveMax) {
      throw AuthException.badRequest(
          "Only "
              + effectiveMax
              + " coupon(s) may be applied per recharge order (stacking-mode="
              + mode.name().toLowerCase()
              + ")");
    }
  }

  void assertNoConcurrentPendingRechargeCoupon(SaasPrincipal principal) {
    if (!billingAppProperties.getCoupon().isBlockConcurrentPendingRechargeCoupons()) {
      return;
    }
    var pending =
        orderMapper.countPendingWithCouponForUser(principal.tenantId(), principal.userId());
    if (pending > 0) {
      throw AuthException.badRequest(
          "Complete or cancel your pending recharge order before applying another coupon");
    }
  }

  void assertMinPayableAfterDiscount(long listPriceCents, long discountCents) {
    var minPayable = Math.max(billingAppProperties.getCoupon().getMinPayableCentsAfterDiscount(), 0L);
    var payable = Math.max(listPriceCents - discountCents, 0L);
    if (payable < minPayable) {
      throw AuthException.badRequest(
          "Coupon discount exceeds allowed amount; minimum payable is "
              + minPayable
              + " cents");
    }
  }
}
