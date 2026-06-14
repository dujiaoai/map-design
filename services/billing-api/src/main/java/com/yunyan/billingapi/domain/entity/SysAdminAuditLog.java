package com.yunyan.billingapi.domain.entity;

import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
public class SysAdminAuditLog {

  private UUID id;
  private UUID actorUserId;
  private String actorEmail;
  private UUID actorTenantId;
  private String action;
  private String resourceType;
  private String resourceId;
  private UUID targetTenantId;
  private boolean crossTenant;
  private String detail;
  private Instant createdAt;
}
