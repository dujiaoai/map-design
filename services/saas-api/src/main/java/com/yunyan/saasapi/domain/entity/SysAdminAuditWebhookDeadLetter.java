package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_admin_audit_webhook_dead_letter")
public class SysAdminAuditWebhookDeadLetter {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID logId;
  private String payload;
  private int attempts;
  private String lastError;
  private Instant createdAt;
  private Instant updatedAt;
}
