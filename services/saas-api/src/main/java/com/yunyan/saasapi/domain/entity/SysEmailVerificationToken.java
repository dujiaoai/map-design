package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_email_verification_token")
public class SysEmailVerificationToken {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID userId;
  private String purpose;
  private String tokenHash;
  private Instant expiresAt;
  private Instant consumedAt;
  private Instant createdAt;
}
