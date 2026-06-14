package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_tenant")
public class SysTenant {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String name;
  private String slug;
  private String plan;
  /** active | suspended */
  private String status;
  /** organization | personal */
  private String tenantKind;
  private Instant createdAt;
}
