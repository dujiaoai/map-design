package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_user_mfa_recovery_code")
public class SysUserMfaRecoveryCode {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID userId;
  private String codeHash;
  private Instant usedAt;
  private Instant createdAt;
}
