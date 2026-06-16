package com.yunyan.saasapi.application.admin;

import org.springframework.util.StringUtils;

public record AdminListParams(
    String q, Integer page, Integer size, String status, String sortBy, String sortDir) {

  public AdminListParams(String q, Integer page, Integer size) {
    this(q, page, size, null, null, null);
  }

  public AdminListParams(String q, Integer page, Integer size, String status) {
    this(q, page, size, status, null, null);
  }

  public static final int DEFAULT_PAGE_SIZE = 20;
  public static final int MAX_PAGE_SIZE = 100;

  public boolean isPaginated() {
    return page != null && size != null;
  }

  public int resolvePage() {
    if (page == null || page < 1) {
      return 1;
    }
    return page;
  }

  public int resolveSize() {
    if (size == null || size < 1) {
      return DEFAULT_PAGE_SIZE;
    }
    return Math.min(size, MAX_PAGE_SIZE);
  }

  public String normalizedQuery() {
    if (!StringUtils.hasText(q)) {
      return null;
    }
    return q.trim();
  }

  public String normalizedStatus() {
    if (!StringUtils.hasText(status)) {
      return null;
    }
    var normalized = status.trim();
    if ("all".equalsIgnoreCase(normalized)) {
      return null;
    }
    return normalized;
  }

  /** 租户列表允许排序的列；缺省 name 升序 */
  public String normalizedTenantSortBy() {
    if (!StringUtils.hasText(sortBy)) {
      return "name";
    }
    return switch (sortBy.trim()) {
      case "name", "slug", "createdAt" -> sortBy.trim();
      default -> "name";
    };
  }

  /** 用户列表允许排序的列；无 sortBy 时由 Repository 使用 tenantId+email 默认序 */
  public boolean hasUserSort() {
    return StringUtils.hasText(sortBy);
  }

  public String normalizedUserSortBy() {
    if (!StringUtils.hasText(sortBy)) {
      return "email";
    }
    return switch (sortBy.trim()) {
      case "email", "displayName", "lastLoginAt", "createdAt", "tenantId" -> sortBy.trim();
      case "tenantSlug" -> "tenantId";
      default -> "email";
    };
  }

  /** 审计列表允许排序的列；缺省 createdAt 降序 */
  public String normalizedAuditSortBy() {
    if (!StringUtils.hasText(sortBy)) {
      return "createdAt";
    }
    return switch (sortBy.trim()) {
      case "createdAt", "actorEmail", "action" -> sortBy.trim();
      default -> "createdAt";
    };
  }

  /** 无 sortDir 时审计默认降序，其余升序 */
  public boolean sortDescending() {
    return StringUtils.hasText(sortDir) && "desc".equalsIgnoreCase(sortDir.trim());
  }

  public boolean auditSortDescending() {
    if (!StringUtils.hasText(sortDir)) {
      return true;
    }
    return "desc".equalsIgnoreCase(sortDir.trim());
  }
}
