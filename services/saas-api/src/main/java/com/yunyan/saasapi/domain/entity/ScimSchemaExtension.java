package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_schema_extension")
public class ScimSchemaExtension {

  @TableId(type = IdType.INPUT)
  private UUID tenantId;

  private String attributesJson;
  private Instant updatedAt;
}
