package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("tenant_saml_config")
public class TenantSamlConfig {

  @TableId(type = IdType.INPUT)
  private UUID tenantId;

  private String entityId;
  private String ssoUrl;
  private String acsUrl;
  private String spEntityId;
  private String certificatePem;
  private String metadataUrl;
  private String spCertificatePem;
  private Instant spCertificateExpiresAt;
  private Boolean enabled;
  private Boolean metadataSyncEnabled;
  private Instant lastMetadataSyncAt;
  private Instant idpCertExpiresAt;
  private Instant createdAt;
  private Instant updatedAt;
}
