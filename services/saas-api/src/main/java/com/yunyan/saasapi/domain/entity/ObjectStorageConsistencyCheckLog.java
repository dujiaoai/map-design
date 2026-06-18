package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("object_storage_consistency_check_log")
public class ObjectStorageConsistencyCheckLog {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String objectKey;
  private String primaryEtag;
  private String replicaEtag;
  private Long primarySize;
  private Long replicaSize;
  private Boolean matched;
  private Instant checkedAt;
}
