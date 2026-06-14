package com.yunyan.billingapi.domain.mapper;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

/** Join row for platform admin manual adjust ledger listing. */
@Data
public class AdminAdjustRecordRow {

  private UUID id;
  private UUID walletId;
  private UUID tenantId;
  private UUID userId;
  private Long amount;
  private Long balanceAfter;
  private String remark;
  private String idempotencyKey;
  private Instant createdAt;
}
