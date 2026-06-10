package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_permission")
public class SysPermission {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String code;

  private String name;

  private String description;

  /** platform | tenant | workspace */
  private String scope;
}
