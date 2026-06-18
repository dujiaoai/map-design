package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("scim_group_member")
public class ScimGroupMember {

  private UUID groupId;
  private UUID userId;
  private Instant createdAt;
}
