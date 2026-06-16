package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_user_mfa_totp")
public class SysUserMfaTotp {

  @TableId(type = IdType.INPUT)
  private UUID userId;

  private String secretCiphertext;
  private Instant verifiedAt;
  private Instant createdAt;
}
