package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_data_export_request")
public class TenantDataExportRequest {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  /** pending | processing | completed | failed */
  private String status;
  private UUID requestedByUserId;
  private String artifactUrl;
  private Instant createdAt;
  private Instant completedAt;
}
