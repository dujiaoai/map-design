package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("audit_webhook_target")
public class AuditWebhookTarget {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String url;
  /** jsonl | ndjson */
  private String format;
  private Boolean enabled;
  private Integer priority;
  private Instant createdAt;
  private Instant updatedAt;
}
