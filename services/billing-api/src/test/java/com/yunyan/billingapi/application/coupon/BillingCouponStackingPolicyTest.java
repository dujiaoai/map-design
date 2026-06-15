package com.yunyan.billingapi.application.coupon;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.domain.mapper.BillingRechargeOrderMapper;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.SaasPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BillingCouponStackingPolicyTest {

  @Mock BillingRechargeOrderMapper orderMapper;

  private BillingAppProperties billingAppProperties;
  private BillingCouponStackingPolicy policy;

  @BeforeEach
  void setUp() {
    billingAppProperties = new BillingAppProperties();
    policy = new BillingCouponStackingPolicy(billingAppProperties, orderMapper);
  }

  private SaasPrincipal principal(UUID userId, UUID tenantId) {
    return new SaasPrincipal(
        userId, tenantId, "test@example.com", List.of(), List.of(), "jti", Instant.now());
  }

  @Test
  void allowsSingleCouponCheckout() {
    var principal = principal(UUID.randomUUID(), UUID.randomUUID());

    assertThatCode(
            () ->
                policy.assertRechargeCheckoutAllowed(
                    principal, List.of("SAVE10"), 4900L, 1000L))
        .doesNotThrowAnyException();
  }

  @Test
  void rejectsMultipleCouponsInSingleMode() {
    var principal = principal(UUID.randomUUID(), UUID.randomUUID());

    assertThatThrownBy(
            () ->
                policy.assertRechargeCheckoutAllowed(
                    principal, List.of("A", "B"), 4900L, 1000L))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("Only 1 coupon");
  }

  @Test
  void rejectsWhenPayableBelowConfiguredMinimum() {
    billingAppProperties.getCoupon().setMinPayableCentsAfterDiscount(100L);
    var principal = principal(UUID.randomUUID(), UUID.randomUUID());

    assertThatThrownBy(
            () ->
                policy.assertRechargeCheckoutAllowed(
                    principal, List.of("FULL"), 4900L, 4900L))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("minimum payable");
  }

  @Test
  void rejectsConcurrentPendingRechargeCoupon() {
    var tenantId = UUID.randomUUID();
    var userId = UUID.randomUUID();
    var principal = principal(userId, tenantId);
    when(orderMapper.countPendingWithCouponForUser(tenantId, userId)).thenReturn(1L);

    assertThatThrownBy(
            () ->
                policy.assertRechargeCheckoutAllowed(
                    principal, List.of("SAVE10"), 4900L, 500L))
        .isInstanceOf(AuthException.class)
        .hasMessageContaining("pending recharge order");
  }
}
