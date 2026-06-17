package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_ops_alert")
public class BillingOpsAlert {

  private UUID id;
  private String alertType;
  private String severity;
  private String referenceKey;
  private String title;
  private String body;
  private String payloadJson;
  private Instant resolvedAt;
  private Instant createdAt;
}
