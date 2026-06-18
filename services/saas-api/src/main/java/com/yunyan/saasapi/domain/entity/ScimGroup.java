package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_group")
public class ScimGroup {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String externalId;
  private String displayName;
  private String roleCode;
  private Instant createdAt;
  private Instant updatedAt;
}
