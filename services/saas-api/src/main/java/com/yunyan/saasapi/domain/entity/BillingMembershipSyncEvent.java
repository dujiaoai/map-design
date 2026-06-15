package com.yunyan.saasapi.domain.entity;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class BillingMembershipSyncEvent {
  private UUID id;
  private String eventType;
  private String payload;
  private Instant createdAt;
  private Instant processedAt;
  private String processedBy;
}
