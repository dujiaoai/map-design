package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_role")
public class SysRole {

  public static final UUID SYSTEM_TENANT_ID =
      UUID.fromString("00000000-0000-0000-0000-000000000000");

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;

  private String code;

  private String name;

  private String description;

  private Boolean isSystem;

  public boolean isSystemRole() {
    return Boolean.TRUE.equals(isSystem);
  }
}
