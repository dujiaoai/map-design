package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_saml_idp_registration")
public class TenantSamlIdpRegistration {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String registrationTokenHash;
  private String idpEntityId;
  /** pending | approved */
  private String status;
  private Instant createdAt;
  private Instant updatedAt;
}
