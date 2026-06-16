package com.yunyan.saasapi.application.admin;

import java.time.Instant;
import java.util.UUID;
import org.springframework.util.StringUtils;

public record AuditLogListParams(
    String q,
    Integer page,
    Integer size,
    String action,
    Boolean crossTenant,
    UUID tenantId,
    Long from,
    Long to,
    UUID actorUserId,
    String sortBy,
    String sortDir) {

  public AuditLogListParams(
      String q,
      Integer page,
      Integer size,
      String action,
      Boolean crossTenant,
      UUID tenantId,
      Long from,
      Long to,
      UUID actorUserId) {
    this(q, page, size, action, crossTenant, tenantId, from, to, actorUserId, null, null);
  }

  public AdminListParams toListParams() {
    return new AdminListParams(q, page, size, null, sortBy, sortDir);
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

  public Instant normalizedFrom() {
    if (from == null || from < 0) {
      return null;
    }
    return Instant.ofEpochMilli(from);
  }

  public Instant normalizedTo() {
    if (to == null || to < 0) {
      return null;
    }
    return Instant.ofEpochMilli(to);
  }

  public UUID normalizedActorUserId() {
    return actorUserId;
  }
}
