package com.yunyan.billingapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("billing_invoice_request")
public class BillingInvoiceRequest {

  private UUID id;
  private UUID tenantId;
  private UUID userId;
  private String orderNo;
  private String invoiceType;
  private String title;
  private String taxNo;
  private String email;
  private String status;
  private Long amountCents;
  private String currency;
  private String adminRemark;
  private String pdfUrl;
  private String dedupeKey;
  private Instant createdAt;
  private Instant updatedAt;
}
