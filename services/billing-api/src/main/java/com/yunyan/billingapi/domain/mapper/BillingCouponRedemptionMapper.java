package com.yunyan.billingapi.domain.mapper;

import com.yunyan.billingapi.domain.entity.BillingCouponRedemption;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface BillingCouponRedemptionMapper {

  @Insert(
      """
      INSERT INTO billing_coupon_redemption (
          id, coupon_id, tenant_id, user_id, points, dedupe_key, created_at
      ) VALUES (
          #{id}, #{couponId}, #{tenantId}, #{userId}, #{points}, #{dedupeKey}, #{createdAt}
      )
      """)
  int insert(BillingCouponRedemption redemption);

  @Select(
      """
      SELECT COUNT(*) FROM billing_coupon_redemption
      WHERE coupon_id = #{couponId} AND tenant_id = #{tenantId} AND user_id = #{userId}
      """)
  long countForUser(
      @Param("couponId") UUID couponId,
      @Param("tenantId") UUID tenantId,
      @Param("userId") UUID userId);

  @Select(
      """
      SELECT id, coupon_id, tenant_id, user_id, points, dedupe_key, created_at
      FROM billing_coupon_redemption
      WHERE dedupe_key = #{dedupeKey}
      """)
  BillingCouponRedemption findByDedupeKey(@Param("dedupeKey") String dedupeKey);
}
