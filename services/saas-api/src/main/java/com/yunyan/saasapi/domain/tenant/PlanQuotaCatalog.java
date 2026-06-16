package com.yunyan.saasapi.domain.tenant;

import java.util.Locale;
import java.util.Set;

/** sys_tenant.plan → seat / API rate / storage 上限（配置型目录，非 DB 表）。 */
public final class PlanQuotaCatalog {

  public record PlanLimits(Integer maxSeats, int apiRatePerMinute, long storageBytes) {}

  private static final PlanLimits FREE = new PlanLimits(5, 60, 1L * 1024 * 1024 * 1024);
  private static final PlanLimits SOLO = new PlanLimits(1, 30, 512L * 1024 * 1024);
  private static final PlanLimits PRO = new PlanLimits(25, 300, 10L * 1024 * 1024 * 1024);
  private static final PlanLimits ENTERPRISE = new PlanLimits(null, 1_000, 100L * 1024 * 1024 * 1024);

  public static final Set<String> KNOWN_PLANS = Set.of("free", "solo", "pro", "enterprise");

  public static PlanLimits forPlan(String plan) {
    if (plan == null || plan.isBlank()) {
      return FREE;
    }
    return switch (plan.trim().toLowerCase(Locale.ROOT)) {
      case "solo" -> SOLO;
      case "pro" -> PRO;
      case "enterprise" -> ENTERPRISE;
      default -> FREE;
    };
  }

  private PlanQuotaCatalog() {}
}
