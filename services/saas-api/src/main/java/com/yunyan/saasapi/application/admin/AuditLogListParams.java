package com.yunyan.saasapi.application.admin;

import java.util.UUID;
import org.springframework.util.StringUtils;

public record AuditLogListParams(
    String q, Integer page, Integer size, String action, Boolean crossTenant, UUID tenantId) {

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

  public UUID normalizedTenantId() {
    return tenantId;
  }
}
