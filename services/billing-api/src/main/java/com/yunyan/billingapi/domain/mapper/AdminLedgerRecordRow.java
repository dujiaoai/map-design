package com.yunyan.billingapi.domain.mapper;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

/** Join row for platform admin ledger listing. */
@Data
public class AdminLedgerRecordRow {

  private UUID id;
  private UUID walletId;
  private UUID tenantId;
  private UUID userId;
  private String entryType;
  private Long amount;
  private Long balanceAfter;
  private String productCode;
  private String remark;
  private Instant createdAt;
}
