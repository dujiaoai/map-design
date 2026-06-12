package com.yunyan.saasapi.application.admin;

import org.springframework.util.StringUtils;

public record AdminListParams(String q, Integer page, Integer size) {

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
}
