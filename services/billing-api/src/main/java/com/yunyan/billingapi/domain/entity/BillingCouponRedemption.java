package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_coupon_redemption")
public class BillingCouponRedemption {

  private UUID id;
  private UUID couponId;
  private UUID tenantId;
  private UUID userId;
  private Long points;
  private String dedupeKey;
  private Instant createdAt;
}
