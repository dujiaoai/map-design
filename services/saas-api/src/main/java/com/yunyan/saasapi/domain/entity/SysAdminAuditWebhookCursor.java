package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_admin_audit_webhook_cursor")
public class SysAdminAuditWebhookCursor {

  @TableId(type = IdType.INPUT)
  private String id;

  private UUID lastDeliveredId;
  private Instant lastDeliveredAt;
  private Instant updatedAt;
}
