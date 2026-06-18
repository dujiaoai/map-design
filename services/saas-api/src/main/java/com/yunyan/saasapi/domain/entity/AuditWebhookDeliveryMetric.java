package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("audit_webhook_delivery_metric")
public class AuditWebhookDeliveryMetric {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private LocalDate metricDate;
  private long successCount;
  private long failureCount;
  private long totalLatencyMs;
  private Instant recordedAt;
}
