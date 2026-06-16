package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("uav_dock")
public class UavDock {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private String name;
  private String locationLabel;
  private Integer droneCount;
  private String status;
  private Integer batteryPercent;
  private Integer sortOrder;
  private Instant createdAt;
}
