package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_recharge_order")
public class BillingRechargeOrder {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String orderNo;
  private UUID tenantId;
  private UUID userId;
  private UUID walletId;
  private UUID packageId;
  private String channel;
  private String status;
  private Long points;
  private Long listPriceCents;
  private Long priceCents;
  private Long couponDiscountCents;
  private String couponCode;
  private String currency;
  private String providerTradeNo;
  private Instant expireAt;
  private Instant paidAt;
  private Instant createdAt;
  private Instant updatedAt;
}
