package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_sync_event")
public class ScimSyncEvent {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String eventType;
  private String externalId;
  private String payload;
  /** pending | resolved */
  private String status;
  private Instant createdAt;
  private Instant resolvedAt;
}
