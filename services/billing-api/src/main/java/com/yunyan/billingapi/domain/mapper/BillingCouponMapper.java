package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingCoupon;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface BillingCouponMapper {

  @Insert(
      """
      INSERT INTO billing_coupon (
          id, code, kind, points, discount_cents, status, max_total_redemptions, redemption_count,
          max_per_user, valid_until, created_at, updated_at
      ) VALUES (
          #{id}, #{code}, #{kind}, #{points}, #{discountCents}, #{status}, #{maxTotalRedemptions},
          #{redemptionCount}, #{maxPerUser}, #{validUntil}, #{createdAt}, #{updatedAt}
      )
      """)
  int insert(BillingCoupon coupon);

  @Select(
      """
      SELECT id, code, kind, points, discount_cents, status, max_total_redemptions, redemption_count,
             max_per_user, valid_until, created_at, updated_at
      FROM billing_coupon
      WHERE code = #{code}
      """)
  BillingCoupon findByCode(@Param("code") String code);

  @Select(
      """
      SELECT id, code, kind, points, discount_cents, status, max_total_redemptions, redemption_count,
             max_per_user, valid_until, created_at, updated_at
      FROM billing_coupon
      ORDER BY created_at DESC
      """)
  java.util.List<BillingCoupon> findAll();

  @Select(
      """
      <script>
      SELECT id, code, kind, points, discount_cents, status, max_total_redemptions, redemption_count,
             max_per_user, valid_until, created_at, updated_at
      FROM billing_coupon
      <where>
        <if test="status != null and status != ''">AND status = #{status}</if>
        <if test="code != null and code != ''">AND LOWER(code) LIKE LOWER(CONCAT('%', #{code}, '%'))</if>
      </where>
      ORDER BY created_at DESC
      LIMIT #{limit} OFFSET #{offset}
      </script>
      """)
  java.util.List<BillingCoupon> findCouponsAdmin(
      @Param("status") String status,
      @Param("code") String code,
      @Param("limit") int limit,
      @Param("offset") int offset);

  @Select(
      """
      <script>
      SELECT COUNT(*) FROM billing_coupon
      <where>
        <if test="status != null and status != ''">AND status = #{status}</if>
        <if test="code != null and code != ''">AND LOWER(code) LIKE LOWER(CONCAT('%', #{code}, '%'))</if>
      </where>
      </script>
      """)
  long countCouponsAdmin(@Param("status") String status, @Param("code") String code);

  @Update(
      """
      UPDATE billing_coupon
      SET status = #{status},
          max_total_redemptions = #{maxTotalRedemptions},
          valid_until = #{validUntil},
          updated_at = #{updatedAt}
      WHERE code = #{code}
      """)
  int update(
      @Param("code") String code,
      @Param("status") String status,
      @Param("maxTotalRedemptions") Integer maxTotalRedemptions,
      @Param("validUntil") java.time.Instant validUntil,
      @Param("updatedAt") java.time.Instant updatedAt);

  @Update(
      """
      UPDATE billing_coupon
      SET redemption_count = redemption_count + 1, updated_at = #{updatedAt}
      WHERE id = #{id}
        AND status = 'active'
        AND (max_total_redemptions IS NULL OR redemption_count < max_total_redemptions)
      """)
  int incrementRedemption(@Param("id") UUID id, @Param("updatedAt") java.time.Instant updatedAt);
}
