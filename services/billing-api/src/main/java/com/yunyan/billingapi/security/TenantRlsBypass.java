package com.yunyan.billingapi.security;

import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.function.Supplier;

/** Trusted server-side paths that may read/write across tenants ({@code app.bypass_tenant_rls = on}). */
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

  @FunctionalInterface
  public interface ThrowingRunnable {
    void run() throws ServletException, IOException;
  }

  public static void runThrowing(ThrowingRunnable action) throws ServletException, IOException {
    ACTIVE.set(true);
    try {
      action.run();
    } finally {
      ACTIVE.remove();
    }
  }
}
