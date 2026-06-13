package com.yunyan.saasapi.application.admin;

import org.springframework.util.StringUtils;

public record AuditLogListParams(
    String q, Integer page, Integer size, String action, Boolean crossTenant) {

  public AdminListParams toListParams() {
    return new AdminListParams(q, page, size);
  }

  public String normalizedAction() {
    if (!StringUtils.hasText(action)) {
      return null;
    }
    return action.trim();
  }

  public Boolean normalizedCrossTenant() {
    return crossTenant;
  }
}
