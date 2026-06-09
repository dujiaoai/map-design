package com.yunyan.saasapi.security;

public final class TenantContext {

  private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

  private TenantContext() {}

  public static void set(String tenantId) {
    TENANT_ID.set(tenantId);
  }

  public static String get() {
    return TENANT_ID.get();
  }

  public static String require() {
    var tenantId = TENANT_ID.get();
    if (tenantId == null || tenantId.isBlank()) {
      throw new IllegalStateException("tenant_id is not set in TenantContext");
    }
    return tenantId;
  }

  public static void clear() {
    TENANT_ID.remove();
  }

  public static AutoCloseable bind(String tenantId) {
    set(tenantId);
    return TenantContext::clear;
  }

  public static <T> T withTenant(String tenantId, java.util.function.Supplier<T> action) {
    set(tenantId);
    try {
      return action.get();
    } finally {
      clear();
    }
  }

  public static void withTenant(String tenantId, Runnable action) {
    withTenant(
        tenantId,
        () -> {
          action.run();
          return null;
        });
  }
}
