package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_user_external_id")
public class ScimUserExternalId {

  @TableId(type = IdType.INPUT)
  private UUID tenantId;

  private String externalId;
  private UUID userId;
  private Boolean active;
  private Instant createdAt;
}
