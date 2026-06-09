package com.yunyan.saasapi.security;

import java.util.function.Supplier;

/**
 * Marks the current thread for PostgreSQL RLS bypass ({@code app.bypass_tenant_rls = on}).
 * Use only for trusted server-side paths (login, cross-tenant membership lookup).
 */
public final class TenantRlsBypass {

  private static final ThreadLocal<Boolean> ACTIVE = ThreadLocal.withInitial(() -> false);

  private TenantRlsBypass() {}

  public static boolean isActive() {
    return Boolean.TRUE.equals(ACTIVE.get());
  }

  public static <T> T call(Supplier<T> action) {
    ACTIVE.set(true);
    try {
      return action.get();
    } finally {
      ACTIVE.remove();
    }
  }

  public static void run(Runnable action) {
    call(
        () -> {
          action.run();
          return null;
        });
  }
}
