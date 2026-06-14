package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.application.auth.PasswordPolicyService;
import com.yunyan.saasapi.application.auth.UserAuthRepository;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantInviteLinkRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysTenantInviteLink;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.InviteLinkPreviewResponse;
import com.yunyan.saasapi.web.dto.auth.JoinViaInviteLinkRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantInviteLinkService {

  private static final String STATUS_ACTIVE = "active";
  private static final String DEFAULT_ROLE = "MEMBER";
  private static final String PLATFORM_ADMIN = "PLATFORM_ADMIN";

  private final TenantInviteLinkRepository tenantInviteLinkRepository;
  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailTokenHasher emailTokenHasher;
  private final PasswordPolicyService passwordPolicyService;
  private final SaasAppProperties saasAppProperties;

  public InviteLinkPreviewResponse preview(String rawToken) {
    var link = requireUsableLink(rawToken.trim());
    var tenant = requireActiveTenant(link.getTenantId());
    return new InviteLinkPreviewResponse(
        tenant.getName(),
        tenant.getSlug(),
        link.getRoleCode(),
        toEpochMillis(link.getExpiresAt()),
        remainingUses(link));
  }

  @Transactional
  public AuthenticatedUser joinViaInviteLink(JoinViaInviteLinkRequest request) {
    passwordPolicyService.validateNewPassword(request.password());
    var rawToken = request.token().trim();
    var link = requireUsableLink(rawToken);
    var tenant = requireActiveTenant(link.getTenantId());

    var normalizedEmail = EmailNormalizer.normalize(request.email());
    if (userRepository.findByTenantIdAndEmail(tenant.getId(), normalizedEmail).isPresent()) {
      throw AuthException.conflict("Email already registered for this tenant");
    }

    if (!tenantInviteLinkRepository.tryIncrementUseCount(link.getId())) {
      throw AuthException.badRequest("Invite link is no longer available");
    }

    var role =
        roleRepository
            .findRoleForTenantMember(tenant.getId(), link.getRoleCode())
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "Assignable role not found for tenant: " + link.getRoleCode()));

    var user = new com.yunyan.saasapi.domain.entity.SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setDisplayName(resolveDisplayName(normalizedEmail, request.displayName()));
    user.setStatus(STATUS_ACTIVE);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());

    return userAuthRepository
        .findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("User not found after join via invite link"));
  }

  public String buildInviteUrl(String rawToken) {
    return saasAppProperties.getApp().getWebBaseUrl().replaceAll("/$", "")
        + "/join?token="
        + rawToken;
  }

  public String generateRawToken() {
    return emailTokenHasher.generateRawToken();
  }

  public String hashToken(String rawToken) {
    return emailTokenHasher.hash(rawToken);
  }

  public Instant resolveExpiresAt(Integer expiresInHours) {
    if (expiresInHours != null) {
      return Instant.now().plusSeconds(expiresInHours.longValue() * 3600L);
    }
    var defaultTtl = saasAppProperties.getInvite().getLinkDefaultTtl();
    if (defaultTtl == null || defaultTtl.isZero() || defaultTtl.isNegative()) {
      return null;
    }
    return Instant.now().plus(defaultTtl);
  }

  public String resolveRoleCode(UUID tenantId, String roleCode) {
    var resolved = StringUtils.hasText(roleCode) ? roleCode.trim() : DEFAULT_ROLE;
    if (PLATFORM_ADMIN.equals(resolved)) {
      throw AuthException.badRequest("Role " + resolved + " cannot be assigned via invite link");
    }
    roleRepository
        .findRoleForTenantMember(tenantId, resolved)
        .orElseThrow(() -> AuthException.badRequest("Unknown or unsupported role: " + resolved));
    return resolved;
  }

  public SysTenantInviteLink requireUsableLink(String rawToken) {
    if (!StringUtils.hasText(rawToken)) {
      throw AuthException.badRequest("Invalid or expired invite link");
    }
    var link =
        tenantInviteLinkRepository
            .findByTokenHash(emailTokenHasher.hash(rawToken))
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired invite link"));
    if (link.getRevokedAt() != null) {
      throw AuthException.badRequest("Invalid or expired invite link");
    }
    if (link.getExpiresAt() != null && !link.getExpiresAt().isAfter(Instant.now())) {
      throw AuthException.badRequest("Invalid or expired invite link");
    }
    if (link.getMaxUses() != null && link.getUseCount() >= link.getMaxUses()) {
      throw AuthException.badRequest("Invite link has reached its usage limit");
    }
    return link;
  }

  public String resolveLinkStatus(SysTenantInviteLink link) {
    if (link.getRevokedAt() != null) {
      return "revoked";
    }
    if (link.getExpiresAt() != null && !link.getExpiresAt().isAfter(Instant.now())) {
      return "expired";
    }
    if (link.getMaxUses() != null && link.getUseCount() >= link.getMaxUses()) {
      return "exhausted";
    }
    return "active";
  }

  public Integer remainingUses(SysTenantInviteLink link) {
    if (link.getMaxUses() == null) {
      return null;
    }
    return Math.max(0, link.getMaxUses() - link.getUseCount());
  }

  private SysTenant requireActiveTenant(UUID tenantId) {
    var tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired invite link"));
    if (tenant.getStatus() != null && !STATUS_ACTIVE.equals(tenant.getStatus())) {
      throw AuthException.forbidden("Tenant is suspended");
    }
    return tenant;
  }

  private static Long toEpochMillis(Instant instant) {
    return instant == null ? null : instant.toEpochMilli();
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }
}
