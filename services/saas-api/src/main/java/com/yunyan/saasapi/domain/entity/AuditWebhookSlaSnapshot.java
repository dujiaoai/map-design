package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Data;

@Data
@TableName("audit_webhook_sla_snapshot")
public class AuditWebhookSlaSnapshot {

  @TableId(type = IdType.INPUT)
  private LocalDate snapshotDate;

  private Double deliveryRate;
  private Double avgLatencyMs;
  private Long deadLetterCount;
  private Instant createdAt;
}
