package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.application.admin.AdminUsageBudgetAlertService;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.tenant.PlanQuotaCatalog;
import com.yunyan.saasapi.security.ratelimit.RateLimitException;
import com.yunyan.saasapi.security.ratelimit.RateLimitStore;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantApiRateLimitService {

  static final String MSG_EXCEEDED = "Tenant API rate limit exceeded for current plan";
  static final String MSG_BUDGET_THROTTLE = "Tenant API throttled due to platform budget limit";

  private final RateLimitStore rateLimitStore;
  private final SaasAppProperties saasAppProperties;
  private final TenantRepository tenantRepository;
  private final AdminUsageBudgetAlertService budgetAlertService;

  private final Map<UUID, CachedPlan> planCache = new ConcurrentHashMap<>();

  public void check(UUID tenantId) {
    if (!enabled()) {
      return;
    }
    if (budgetAlertService.isBudgetThrottleActive()) {
      var config = saasAppProperties.getRateLimit().getTenantApi();
      var retryAfterSeconds =
          rateLimitStore.tryConsume("tenant-api-budget:" + tenantId, 1, config.getWindow());
      if (retryAfterSeconds.isPresent()) {
        throw RateLimitException.exceeded(
            java.time.Duration.ofSeconds(Math.max(1, retryAfterSeconds.getAsLong())), MSG_BUDGET_THROTTLE);
      }
    }
    var config = saasAppProperties.getRateLimit().getTenantApi();
    var maxPerMinute = resolveMaxPerMinute(tenantId, config.getMaxPerMinuteOverride());
    var retryAfterSeconds =
        rateLimitStore.tryConsume(
            "tenant-api:" + tenantId, maxPerMinute, config.getWindow());
    if (retryAfterSeconds.isPresent()) {
      throw RateLimitException.exceeded(
          Duration.ofSeconds(Math.max(1, retryAfterSeconds.getAsLong())), MSG_EXCEEDED);
    }
  }

  private boolean enabled() {
    return saasAppProperties.getRateLimit().isEnabled()
        && saasAppProperties.getRateLimit().getTenantApi().isEnabled();
  }

  private int resolveMaxPerMinute(UUID tenantId, Integer override) {
    if (override != null && override > 0) {
      return override;
    }
    var plan = resolvePlan(tenantId);
    return PlanQuotaCatalog.forPlan(plan).apiRatePerMinute();
  }

  private String resolvePlan(UUID tenantId) {
    var config = saasAppProperties.getRateLimit().getTenantApi();
    var cached = planCache.get(tenantId);
    var now = Instant.now();
    if (cached != null && now.isBefore(cached.expiresAt())) {
      return cached.plan();
    }
    var plan =
        tenantRepository.findById(tenantId).map(t -> t.getPlan()).orElse("free");
    planCache.put(tenantId, new CachedPlan(plan, now.plus(config.getPlanCacheTtl())));
    return plan;
  }

  private record CachedPlan(String plan, Instant expiresAt) {}
}
