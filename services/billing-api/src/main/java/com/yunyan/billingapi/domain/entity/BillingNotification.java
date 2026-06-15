package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_notification")
public class BillingNotification {

  private UUID id;
  private UUID tenantId;
  private UUID userId;
  private String category;
  private String title;
  private String body;
  private String dedupeKey;
  private Instant readAt;
  private Instant createdAt;
}
