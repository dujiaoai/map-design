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
          points, price_cents, currency, provider_trade_no, expire_at, paid_at, created_at, updated_at
      ) VALUES (
          #{id}, #{orderNo}, #{tenantId}, #{userId}, #{walletId}, #{packageId}, #{channel}, #{status},
          #{points}, #{priceCents}, #{currency}, #{providerTradeNo}, #{expireAt}, #{paidAt}, #{createdAt}, #{updatedAt}
      )
      """)
  void insert(BillingRechargeOrder order);

  @Select(
      """
      SELECT id, order_no, tenant_id, user_id, wallet_id, package_id, channel, status,
             points, price_cents, currency, provider_trade_no, expire_at, paid_at, created_at, updated_at
      FROM billing_recharge_order
      WHERE order_no = #{orderNo} AND tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  BillingRechargeOrder findByOrderNoForUser(
      @Param("orderNo") String orderNo,
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId);

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
}
