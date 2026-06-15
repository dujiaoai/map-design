package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_wire_transfer_request")
public class BillingWireTransferRequest {

  private UUID id;
  private String requestNo;
  private UUID tenantId;
  private UUID userId;
  private String companyName;
  private String contactEmail;
  private Long amountCents;
  private Long points;
  private String bankReference;
  private String status;
  private String adminRemark;
  private UUID creditedLedgerId;
  private Instant createdAt;
  private Instant updatedAt;
}
