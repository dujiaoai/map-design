package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingRechargeOrder;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingRechargeOrderMapper {

  @Insert(
      """
      INSERT INTO billing_recharge_order (
          id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
          points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
          provider_trade_no, expire_at, paid_at, created_at, updated_at
      ) VALUES (
          #{id}, #{orderNo}, #{tenantId}, #{userId}, #{walletId}, #{packageId}, #{channel}, #{status},
          #{points}, #{listPriceCents}, #{priceCents}, #{couponCode}, #{couponDiscountCents}, #{currency},
          #{providerTradeNo}, #{expireAt}, #{paidAt}, #{createdAt}, #{updatedAt}
      )
      """)
  void insert(BillingRechargeOrder order);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE order_no = #{orderNo} AND tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  BillingRechargeOrder findByOrderNoForUser(
      @Param("orderNo") String orderNo,
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE order_no = #{orderNo}
      """)
  BillingRechargeOrder findByOrderNo(@Param("orderNo") String orderNo);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = #{status}, provider_trade_no = #{providerTradeNo},
          paid_at = #{paidAt}, updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int markPaid(
      @Param("id") UUID id,
      @Param("status") String status,
      @Param("providerTradeNo") String providerTradeNo,
      @Param("paidAt") java.time.Instant paidAt,
      @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = 'cancelled', updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int markCancelled(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = 'expired', updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'pending'
      """)
  int markExpired(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE status = 'pending' AND expire_at IS NOT NULL AND expire_at < #{now}
      ORDER BY expire_at ASC
      LIMIT #{limit}
      """)
  java.util.List<BillingRechargeOrder> findExpiredPendingOrders(
      @Param("now") java.time.Instant now, @Param("limit") int limit);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE status = 'pending'
        AND channel IN ('wechat', 'alipay')
        AND (expire_at IS NULL OR expire_at > #{now})
      ORDER BY created_at ASC
      LIMIT #{limit}
      """)
  java.util.List<BillingRechargeOrder> findPendingOnlineOrders(
      @Param("now") java.time.Instant now, @Param("limit") int limit);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = 'refunding', updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'paid'
      """)
  int markRefunding(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = 'refunded', updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'refunding'
      """)
  int markRefunded(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_recharge_order
      SET status = 'paid', updated_at = #{updatedAt}
      WHERE id = #{id} AND status = 'refunding'
      """)
  int revertRefunding(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE status = 'refunding' AND updated_at < #{cutoff}
      ORDER BY updated_at ASC
      LIMIT #{limit}
      """)
  java.util.List<BillingRechargeOrder> findStuckRefundingOrders(
      @Param("cutoff") java.time.Instant cutoff, @Param("limit") int limit);

  @Select(
      """
      <script>
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, list_price_cents, price_cents, coupon_code, coupon_discount_cents, currency,
             provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
        <if test="status != null and status != ''">AND status = #{status}</if>
      </where>
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<BillingRechargeOrder> findOrders(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("status") String status,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_recharge_order
      <where>
        <if test="tenantId != null">AND tenant_id = #{tenantId}</if>
        <if test="userId != null">AND user_id = #{userId}</if>
        <if test="status != null and status != ''">AND status = #{status}</if>
      </where>
      </script>
      """)
  long countOrders(
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId,
      @Param("status") String status);

  @Select("SELECT COUNT(*) FROM billing_recharge_order WHERE status = #{status}")
  long countByStatus(@Param("status") String status);

  @Select(
      "SELECT COALESCE(SUM(price_cents), 0) FROM billing_recharge_order WHERE status = 'paid'")
  long sumPaidPriceCents();

  @Select(
      """
      SELECT COUNT(*) AS count,
             COALESCE(SUM(points), 0) AS points,
             COALESCE(SUM(price_cents), 0) AS gmv_cents
      FROM billing_recharge_order
      WHERE paid_at IS NOT NULL
        AND paid_at >= #{from} AND paid_at < #{to}
        AND status IN ('paid', 'refunding', 'refunded')
      """)
  BillingReconciliationSummary summarizePaidOrdersInRange(
      @Param("from") java.time.Instant from, @Param("to") java.time.Instant to);

  @Select(
      """
      SELECT COUNT(*) AS count,
             COALESCE(SUM(points), 0) AS points,
             COALESCE(SUM(price_cents), 0) AS gmv_cents
      FROM billing_recharge_order
      WHERE status = 'refunded'
        AND updated_at >= #{from} AND updated_at < #{to}
      """)
  BillingReconciliationSummary summarizeRefundedOrdersInRange(
      @Param("from") java.time.Instant from, @Param("to") java.time.Instant to);
}
