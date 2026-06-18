package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("workspace_menu_tenant_override")
public class WorkspaceMenuTenantOverride {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String itemId;
  private Boolean enabled;
  private Integer sortOrder;
  private String title;
  private Instant createdAt;
}
