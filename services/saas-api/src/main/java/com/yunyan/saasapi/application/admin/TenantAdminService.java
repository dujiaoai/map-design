package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.ProductRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.product.ProductCatalog;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantListResponse;
import com.yunyan.saasapi.web.dto.admin.CreateTenantRequest;
import com.yunyan.saasapi.web.dto.admin.PatchTenantRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantAdminService {

  private static final String STATUS_ACTIVE = "active";
  private static final String STATUS_SUSPENDED = "suspended";
  private static final String DEFAULT_PLAN = "free";

  private final TenantRepository tenantRepository;
  private final ProductRepository productRepository;
  private final AdminAuditLogService adminAuditLogService;
  private final TenantSessionRevocationService tenantSessionRevocationService;

  public AdminTenantListResponse listTenants(AdminListParams params) {
    return listTenants(params, null);
  }

  public AdminTenantListResponse listTenants(AdminListParams params, String productCode) {
    UUID productId = null;
    if (StringUtils.hasText(productCode)) {
      productId =
          productRepository
              .findByCode(productCode.trim())
              .map(p -> p.getId())
              .orElse(null);
    }
    var result = tenantRepository.findTenants(params, productId);
    var tenants = result.items().stream().map(this::toDto).toList();
    if (params.isPaginated()) {
      return AdminTenantListResponse.paged(
          tenants, result.total(), params.resolvePage(), params.resolveSize());
    }
    return AdminTenantListResponse.unpaged(tenants);
  }

  public AdminTenantDto getTenant(UUID tenantId) {
    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return toDto(tenant);
  }

  @Transactional
  public AdminTenantDto createTenant(SaasPrincipal principal, CreateTenantRequest request) {
    var slug = normalizeSlug(request.slug());
    if (tenantRepository.findBySlug(slug).isPresent()) {
      throw AuthException.conflict("Tenant slug already exists");
    }

    var tenant = new SysTenant();
    tenant.setId(UUID.randomUUID());
    tenant.setName(request.name().trim());
    tenant.setSlug(slug);
    tenant.setPlan(resolvePlan(request.plan()));
    tenant.setStatus(STATUS_ACTIVE);
    tenant.setPrimaryProductId(ProductCatalog.MAP_DESIGN_ID);
    if (request.trialEndsAt() != null) {
      tenant.setTrialEndsAt(Instant.ofEpochMilli(request.trialEndsAt()));
    }
    tenant.setCreatedAt(Instant.now());
    tenantRepository.insert(tenant);
    adminAuditLogService.recordTenantAction(
        principal,
        "tenant.create",
        tenant.getId(),
        "Created tenant " + slug + " plan=" + tenant.getPlan());
    return toDto(tenant);
  }

  @Transactional
  public AdminTenantDto patchTenant(
      SaasPrincipal principal, UUID tenantId, PatchTenantRequest request) {
    if (!hasPatchFields(request)) {
      throw AuthException.badRequest(
          "At least one of name, plan, status, trialEndsAt, or clearTrialEndsAt is required");
    }

    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var previousStatus = tenant.getStatus();

    if (StringUtils.hasText(request.name())) {
      tenant.setName(request.name().trim());
    }
    if (StringUtils.hasText(request.plan())) {
      tenant.setPlan(request.plan().trim());
    }
    if (StringUtils.hasText(request.status())) {
      tenant.setStatus(request.status().trim());
    }
    if (Boolean.TRUE.equals(request.clearTrialEndsAt())) {
      tenant.setTrialEndsAt(null);
    } else if (request.trialEndsAt() != null) {
      tenant.setTrialEndsAt(Instant.ofEpochMilli(request.trialEndsAt()));
    }

    tenantRepository.update(tenant);
    if (isNewlySuspended(previousStatus, tenant.getStatus())) {
      var revokedSessions = tenantSessionRevocationService.revokeAllMemberSessions(tenantId);
      adminAuditLogService.recordTenantAction(
          principal,
          "tenant.sessions.revoke",
          tenantId,
          "Revoked " + revokedSessions + " member session(s) after suspend");
    }
    var changes = new StringBuilder();
    if (StringUtils.hasText(request.name())) {
      changes.append("name ");
    }
    if (StringUtils.hasText(request.plan())) {
      changes.append("plan=");
      changes.append(tenant.getPlan());
      changes.append(' ');
    }
    if (StringUtils.hasText(request.status())) {
      changes.append("status=");
      changes.append(tenant.getStatus());
    }
    if (Boolean.TRUE.equals(request.clearTrialEndsAt())) {
      changes.append("trialEndsAt=cleared ");
    } else if (request.trialEndsAt() != null) {
      changes.append("trialEndsAt=set ");
    }
    adminAuditLogService.recordTenantAction(
        principal,
        "tenant.update",
        tenantId,
        "Updated tenant " + tenant.getSlug() + ": " + changes.toString().trim());
    return toDto(tenant);
  }

  private static boolean hasPatchFields(PatchTenantRequest request) {
    return StringUtils.hasText(request.name())
        || StringUtils.hasText(request.plan())
        || StringUtils.hasText(request.status())
        || request.trialEndsAt() != null
        || Boolean.TRUE.equals(request.clearTrialEndsAt());
  }

  private static String normalizeSlug(String slug) {
    return slug.trim().toLowerCase();
  }

  private static String resolvePlan(String plan) {
    if (!StringUtils.hasText(plan)) {
      return DEFAULT_PLAN;
    }
    return plan.trim();
  }

  private static boolean isNewlySuspended(String previousStatus, String newStatus) {
    if (!STATUS_SUSPENDED.equalsIgnoreCase(newStatus)) {
      return false;
    }
    return previousStatus == null || !STATUS_SUSPENDED.equalsIgnoreCase(previousStatus);
  }

  private AdminTenantDto toDto(SysTenant tenant) {
    var createdAt = tenant.getCreatedAt() == null ? 0L : tenant.getCreatedAt().toEpochMilli();
    var status = tenant.getStatus() == null ? STATUS_ACTIVE : tenant.getStatus();
    var productCode = resolveProductCode(tenant.getPrimaryProductId());
    return new AdminTenantDto(
        tenant.getId().toString(),
        tenant.getName(),
        tenant.getSlug(),
        tenant.getPlan(),
        status,
        tenant.getTrialEndsAt() == null ? null : tenant.getTrialEndsAt().toEpochMilli(),
        TenantOnboardingPhase.resolve(tenant),
        productCode,
        createdAt);
  }

  private String resolveProductCode(UUID productId) {
    if (productId == null) {
      return ProductCatalog.MAP_DESIGN_CODE;
    }
    return productRepository
        .findById(productId)
        .map(p -> p.getCode())
        .orElse(ProductCatalog.MAP_DESIGN_CODE);
  }
}
