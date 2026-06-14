package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_recharge_package")
public class BillingRechargePackage {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String code;
  private Long points;
  private Long priceCents;
  private String currency;
  private String status;
  private Integer sortOrder;
  private Instant createdAt;
}
