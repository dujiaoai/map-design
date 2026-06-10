package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_role_permission")
public class SysRolePermission {

  private UUID roleId;

  private UUID permissionId;
}
