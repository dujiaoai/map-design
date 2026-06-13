package com.yunyan.saasapi.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.time.Instant;
import java.util.UUID;
import lombok.Data;

@Data
@TableName("sys_email_outbox")
public class SysEmailOutbox {

  @TableId(type = IdType.INPUT)
  private UUID id;

  private UUID tenantId;
  private UUID userId;
  private String template;
  private String toEmail;
  private String payloadJson;
  private String status;
  private String errorMessage;
  private Instant createdAt;
  private Instant sentAt;
}
