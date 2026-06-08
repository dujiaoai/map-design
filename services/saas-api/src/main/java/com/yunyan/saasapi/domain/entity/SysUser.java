package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_user")
public class SysUser {

  @TableId(type = IdType.ASSIGN_UUID)
  private UUID id;

  private UUID tenantId;
  private String email;
  private String passwordHash;
  private String displayName;
  private String status;
  private Instant createdAt;
}
