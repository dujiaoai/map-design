package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.email.TenantInviteLinkService;
import com.yunyan.saasapi.domain.TenantInviteLinkRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysTenantInviteLink;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.admin.CreateTenantInviteLinkRequest;
import com.yunyan.saasapi.web.dto.admin.CreateTenantInviteLinkResponse;
import com.yunyan.saasapi.web.dto.admin.TenantInviteLinkDto;
import com.yunyan.saasapi.web.dto.admin.TenantInviteLinkListResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantInviteLinkAdminService {

  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";
  private static final String STATUS_ACTIVE = "active";

  private final TenantInviteLinkRepository tenantInviteLinkRepository;
  private final TenantRepository tenantRepository;
  private final TenantInviteLinkService tenantInviteLinkService;
  private final AdminAuditLogService adminAuditLogService;

  public TenantInviteLinkListResponse listLinks(SaasPrincipal principal, UUID tenantId) {
    ensureOwnTenant(principal, tenantId);
    return withTargetTenant(
        tenantId,
        () -> {
          requireActiveTenant(tenantId);
          var links =
              tenantInviteLinkRepository.findByTenantId(tenantId).stream()
                  .map(this::toDto)
                  .toList();
          return new TenantInviteLinkListResponse(links);
        });
  }

  @Transactional
  public CreateTenantInviteLinkResponse createLink(
      SaasPrincipal principal, UUID tenantId, CreateTenantInviteLinkRequest request) {
    ensureOwnTenant(principal, tenantId);
    var result =
        withTargetTenant(
            tenantId,
            () -> {
              requireActiveTenant(tenantId);
              var roleCode = tenantInviteLinkService.resolveRoleCode(tenantId, request.roleCode());
              var rawToken = tenantInviteLinkService.generateRawToken();

              var link = new SysTenantInviteLink();
              link.setId(UUID.randomUUID());
              link.setTenantId(tenantId);
              link.setTokenHash(tenantInviteLinkService.hashToken(rawToken));
              link.setRoleCode(roleCode);
              link.setLabel(normalizeLabel(request.label()));
              link.setMaxUses(request.maxUses());
              link.setUseCount(0);
              link.setExpiresAt(tenantInviteLinkService.resolveExpiresAt(request.expiresInHours()));
              link.setCreatedBy(principal.userId());
              link.setCreatedAt(Instant.now());
              tenantInviteLinkRepository.insert(link);

              var inviteUrl = tenantInviteLinkService.buildInviteUrl(rawToken);
              return new CreateTenantInviteLinkResponse(toDto(link), inviteUrl);
            });
    adminAuditLogService.recordMemberAction(
        principal,
        "member.invite-link.create",
        tenantId,
        UUID.fromString(result.link().id()),
        "Created invite link role=" + result.link().roleCode());
    return result;
  }

  @Transactional
  public TenantInviteLinkDto revokeLink(SaasPrincipal principal, UUID tenantId, UUID linkId) {
    ensureOwnTenant(principal, tenantId);
    var result =
        withTargetTenant(
            tenantId,
            () -> {
              requireActiveTenant(tenantId);
              var link =
                  tenantInviteLinkRepository
                      .findById(linkId)
                      .filter(row -> tenantId.equals(row.getTenantId()))
                      .orElseThrow(() -> AuthException.notFound("Invite link not found"));
              if (link.getRevokedAt() == null) {
                tenantInviteLinkRepository.revoke(linkId, Instant.now());
                link.setRevokedAt(Instant.now());
              }
              return toDto(link);
            });
    adminAuditLogService.recordMemberAction(
        principal,
        "member.invite-link.revoke",
        tenantId,
        linkId,
        "Revoked invite link " + linkId);
    return result;
  }

  private TenantInviteLinkDto toDto(SysTenantInviteLink link) {
    return new TenantInviteLinkDto(
        link.getId().toString(),
        link.getRoleCode(),
        link.getLabel(),
        link.getMaxUses(),
        link.getUseCount(),
        toEpochMillis(link.getExpiresAt()),
        toEpochMillis(link.getRevokedAt()),
        link.getCreatedAt() == null ? 0L : link.getCreatedAt().toEpochMilli(),
        tenantInviteLinkService.resolveLinkStatus(link));
  }

  private static String normalizeLabel(String label) {
    if (!StringUtils.hasText(label)) {
      return null;
    }
    return label.trim();
  }

  private static Long toEpochMillis(Instant instant) {
    return instant == null ? null : instant.toEpochMilli();
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

  private void ensureOwnTenant(SaasPrincipal principal, UUID tenantId) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    if (isPlatformAdmin(principal)) {
      requireTenant(tenantId);
      return;
    }
    if (!principal.tenantId().equals(tenantId)) {
      throw AuthException.forbidden("Tenant access denied");
    }
    requireTenant(tenantId);
  }

  private static boolean isPlatformAdmin(SaasPrincipal principal) {
    return principal.roleCodes().contains(PLATFORM_ADMIN);
  }

  private SysTenant requireTenant(UUID tenantId) {
    return tenantRepository
        .findById(tenantId)
        .orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  private SysTenant requireActiveTenant(UUID tenantId) {
    var tenant = requireTenant(tenantId);
    if (tenant.getStatus() != null && !STATUS_ACTIVE.equals(tenant.getStatus())) {
      throw AuthException.forbidden("Tenant is suspended");
    }
    return tenant;
  }
}
