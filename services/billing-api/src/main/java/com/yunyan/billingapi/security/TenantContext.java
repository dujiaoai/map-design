package com.yunyan.billingapi.security;

public final class TenantContext {

  private static final ThreadLocal<String> TENANT_ID = new ThreadLocal<>();

  private TenantContext() {}

  public static void set(String tenantId) {
    TENANT_ID.set(tenantId);
  }

  public static String get() {
    return TENANT_ID.get();
  }

  public static void clear() {
    TENANT_ID.remove();
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
