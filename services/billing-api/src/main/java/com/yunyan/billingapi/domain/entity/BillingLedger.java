package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_ledger")
public class BillingLedger {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID walletId;
  private UUID tenantId;
  private String entryType;
  private Long amount;
  private Long balanceAfter;
  private String productCode;
  private String remark;
  private String idempotencyKey;
  private Instant createdAt;
}
