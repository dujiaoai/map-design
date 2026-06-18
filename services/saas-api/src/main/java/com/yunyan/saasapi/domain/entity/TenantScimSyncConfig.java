package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_scim_sync_config")
public class TenantScimSyncConfig {

  @TableId(type = IdType.INPUT)
  private UUID tenantId;

  /** last_write_wins | idp_wins */
  private String conflictStrategy;
  private Instant updatedAt;
}
