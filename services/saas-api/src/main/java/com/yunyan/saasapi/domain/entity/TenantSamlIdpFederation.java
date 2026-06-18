package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_saml_idp_federation")
public class TenantSamlIdpFederation {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String idpEntityId;
  private String ssoUrl;
  private String certificatePem;
  private Integer priority;
  private Boolean enabled;
  private Instant createdAt;
  private Instant updatedAt;
}
