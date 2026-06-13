package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_tenant_invite_link")
public class SysTenantInviteLink {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String tokenHash;
  private String roleCode;
  private String label;
  private Integer maxUses;
  private int useCount;
  private Instant expiresAt;
  private Instant revokedAt;
  private UUID createdBy;
  private Instant createdAt;
}
