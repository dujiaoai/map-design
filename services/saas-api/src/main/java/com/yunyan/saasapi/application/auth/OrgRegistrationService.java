package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.email.RegistrationVerificationService;
import com.yunyan.saasapi.application.tenant.TenantSlugGenerator;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class OrgRegistrationService {

  private static final String TENANT_ADMIN_ROLE = "TENANT_ADMIN";
  private static final String DEFAULT_PLAN = "free";

  private final SaasAppProperties saasAppProperties;
  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final PasswordPolicyService passwordPolicyService;
  private final RegistrationVerificationService registrationVerificationService;

  @Transactional
  public RegisterOrgResponse requestOrgRegistration(RegisterOrgRequest request) {
    if (!saasAppProperties.getRegistration().isAllowPublicOrgSignup()) {
      throw AuthException.forbidden("Public organization signup is disabled");
    }

    passwordPolicyService.validateNewPassword(request.password());

    var orgName = request.orgName().trim();
    if (!StringUtils.hasText(orgName)) {
      throw AuthException.badRequest("Organization name is required");
    }

    var normalizedEmail = EmailNormalizer.normalize(request.email());

    var preferredSlug =
        StringUtils.hasText(request.slug())
            ? TenantSlugGenerator.normalizeSlug(request.slug())
            : TenantSlugGenerator.slugFromOrgName(orgName);
    if (preferredSlug == null) {
      var at = normalizedEmail.indexOf('@');
      if (at > 0) {
        preferredSlug = TenantSlugGenerator.slugFromOrgName(normalizedEmail.substring(0, at));
      }
    }
    if (preferredSlug == null) {
      preferredSlug = "org-" + UUID.randomUUID().toString().substring(0, 8);
    }

    var slug = TenantSlugGenerator.resolveUniqueSlug(preferredSlug, tenantRepository);

    var tenant = new SysTenant();
    tenant.setId(UUID.randomUUID());
    tenant.setName(orgName);
    tenant.setSlug(slug);
    tenant.setPlan(DEFAULT_PLAN);
    tenant.setStatus("active");
    tenant.setCreatedAt(Instant.now());
    tenantRepository.insert(tenant);

    var role =
        roleRepository
            .findByCode(TENANT_ADMIN_ROLE)
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + TENANT_ADMIN_ROLE));

    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setDisplayName(resolveDisplayName(normalizedEmail, request.displayName()));
    user.setStatus(RegistrationVerificationService.STATUS_UNVERIFIED);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());

    registrationVerificationService.sendRegistrationVerification(tenant, user);

    return new RegisterOrgResponse(slug, orgName);
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }
}
