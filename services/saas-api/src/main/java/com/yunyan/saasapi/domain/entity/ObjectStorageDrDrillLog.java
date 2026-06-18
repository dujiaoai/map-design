package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("object_storage_dr_drill_log")
public class ObjectStorageDrDrillLog {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private String status;
  private String detail;
  private Instant executedAt;
}
