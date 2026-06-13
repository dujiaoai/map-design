package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_admin_audit_log")
public class SysAdminAuditLog {

  @TableId(type = IdType.INPUT)
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
