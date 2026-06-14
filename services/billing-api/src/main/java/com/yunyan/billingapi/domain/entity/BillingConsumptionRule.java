package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_consumption_rule")
public class BillingConsumptionRule {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String code;
  private String productCode;
  private Long pointsPerUnit;
  private String unitLabel;
  private String status;
  private Instant createdAt;
}
