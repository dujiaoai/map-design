package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_consumption_record")
public class BillingConsumptionRecord {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private UUID userId;
  private UUID walletId;
  private String productCode;
  private String ruleCode;
  private Long quantity;
  private Long points;
  private String status;
  private String bizRef;
  private String idempotencyKey;
  private Instant holdExpiresAt;
  private Instant createdAt;
  private Instant updatedAt;
}
