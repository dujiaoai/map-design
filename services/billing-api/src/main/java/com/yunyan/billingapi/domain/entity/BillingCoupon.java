package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_coupon")
public class BillingCoupon {

  private UUID id;
  private String code;
  private Long points;
  private String status;
  private Integer maxTotalRedemptions;
  private Integer redemptionCount;
  private Integer maxPerUser;
  private Instant validUntil;
  private Instant createdAt;
  private Instant updatedAt;
}
