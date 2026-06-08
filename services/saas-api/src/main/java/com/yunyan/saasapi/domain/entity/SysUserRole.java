package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_user_role")
public class SysUserRole {

  private UUID userId;
  private UUID roleId;
}
