package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_outbound_change")
public class ScimOutboundChange {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String resourceType;
  private String externalId;
  /** create | update | delete */
  private String operation;
  private String payload;
  /** pending | delivered | failed */
  private String status;
  private Instant createdAt;
  private Instant updatedAt;
}
