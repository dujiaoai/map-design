package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_oidc_config")
public class TenantOidcConfig {

  @TableId(type = IdType.INPUT)
  private UUID tenantId;

  private Boolean enabled;
  private String displayName;
  private String issuerUri;
  private String clientId;
  private String clientSecret;
  private String scopes;
  private Instant createdAt;
  private Instant updatedAt;
}
