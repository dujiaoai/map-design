package com.yunyan.saasapi.domain.entity;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class BillingSignupBonusPending {

  private UUID id;
  private UUID tenantId;
  private UUID userId;
  private String tenantKind;
  private int attempts;
  private String lastError;
  private Instant createdAt;
  private Instant updatedAt;
}
