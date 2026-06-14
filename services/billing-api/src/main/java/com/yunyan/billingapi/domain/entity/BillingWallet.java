package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_wallet")
public class BillingWallet {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private UUID userId;
  private Long balance;
  private Long frozenBalance;
  private Integer version;
  private Instant createdAt;
  private Instant updatedAt;
}
