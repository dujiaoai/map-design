package com.yunyan.saasapi.application.tenant;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.tenant.PlanQuotaCatalog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.tenant.TenantQuotasResponse;
import com.yunyan.saasapi.web.dto.tenant.TenantQuotasResponse.RateQuotaDto;
import com.yunyan.saasapi.web.dto.tenant.TenantQuotasResponse.SeatQuotaDto;
import com.yunyan.saasapi.web.dto.tenant.TenantQuotasResponse.StorageQuotaDto;
import java.util.UUID;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TenantQuotaService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final TenantService tenantService;

  public TenantQuotasResponse getQuotas(SaasPrincipal principal, UUID tenantId) {
    tenantService.getFeatures(principal, tenantId);
    return withTargetTenant(
        tenantId,
        () -> {
          var tenant =
              tenantRepository
                  .findById(tenantId)
                  .orElseThrow(() -> AuthException.notFound("Tenant not found"));
          return buildResponse(tenant);
        });
  }

  public void ensureSeatAvailable(UUID tenantId) {
    withTargetTenant(
        tenantId,
        () -> {
          var tenant =
              tenantRepository
                  .findById(tenantId)
                  .orElseThrow(() -> AuthException.notFound("Tenant not found"));
          var limits = PlanQuotaCatalog.forPlan(tenant.getPlan());
          if (limits.maxSeats() == null) {
            return null;
          }
          var used = userRepository.countSeatUsage(tenantId);
          if (used >= limits.maxSeats()) {
            throw AuthException.forbidden(
                "Tenant seat limit reached for plan " + normalizePlan(tenant.getPlan()));
          }
          return null;
        });
  }

  private TenantQuotasResponse buildResponse(SysTenant tenant) {
    var limits = PlanQuotaCatalog.forPlan(tenant.getPlan());
    var seatUsed = userRepository.countSeatUsage(tenant.getId());
    return new TenantQuotasResponse(
        tenant.getId().toString(),
        normalizePlan(tenant.getPlan()),
        new SeatQuotaDto(limits.maxSeats(), seatUsed),
        new RateQuotaDto(limits.apiRatePerMinute()),
        new StorageQuotaDto(limits.storageBytes(), 0L));
  }

  private static String normalizePlan(String plan) {
    return plan == null || plan.isBlank() ? "free" : plan.trim();
  }

  private static <T> T withTargetTenant(UUID tenantId, Supplier<T> action) {
    var previous = TenantContext.get();
    TenantContext.set(tenantId.toString());
    try {
      return action.get();
    } finally {
      if (previous == null || previous.isBlank()) {
        TenantContext.clear();
      } else {
        TenantContext.set(previous);
      }
    }
  }
}
