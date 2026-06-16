package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_user_oauth_bind")
public class SysUserOauthBind {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID userId;
  private String providerId;
  private String providerSubject;
  private String emailSnapshot;
  private Instant createdAt;
  private Instant lastUsedAt;
}
