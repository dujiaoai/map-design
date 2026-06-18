package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_saml_disconnect_drill_log")
public class TenantSamlDisconnectDrillLog {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String idpEntityId;
  /** success | failure | timeout */
  private String result;
  private Long latencyMs;
  private Instant drilledAt;
}
