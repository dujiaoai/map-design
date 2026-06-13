package com.yunyan.saasapi.web.dto.admin;

import java.util.List;

public record AdminAuditLogListResponse(
    List<AdminAuditLogDto> logs, Long total, Integer page, Integer size) {

  public AdminAuditLogListResponse(List<AdminAuditLogDto> logs) {
    this(logs, null, null, null);
  }
}
