package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("object_storage_lifecycle_audit")
public class ObjectStorageLifecycleAudit {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String objectKey;
  private int expireDays;
  private Instant recordedAt;
}
