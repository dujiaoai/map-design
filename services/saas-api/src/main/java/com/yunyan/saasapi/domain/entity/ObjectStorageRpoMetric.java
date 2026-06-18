package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("object_storage_rpo_metric")
public class ObjectStorageRpoMetric {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String primaryRegion;
  private String secondaryRegion;
  private Long lagSeconds;
  private Boolean withinRpo;
  private Instant recordedAt;
}
