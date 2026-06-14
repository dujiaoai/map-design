package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.email.RegistrationVerificationService;
import com.yunyan.saasapi.application.tenant.TenantSlugGenerator;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.domain.tenant.PersonalTenantDefaults;
import com.yunyan.saasapi.domain.tenant.TenantKind;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PersonalRegistrationService {

  private static final String MEMBER_ROLE = "MEMBER";
  private static final String DEFAULT_PLAN = "free";

  private final SaasAppProperties saasAppProperties;
  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final PasswordPolicyService passwordPolicyService;
  private final RegistrationVerificationService registrationVerificationService;

  @Transactional
  public RegisterPersonalResponse requestPersonalRegistration(RegisterPersonalRequest request) {
    if (!saasAppProperties.getRegistration().isAllowPublicPersonalSignup()) {
      throw AuthException.forbidden("Public personal signup is disabled");
    }

    passwordPolicyService.validateNewPassword(request.password());

    var normalizedEmail = EmailNormalizer.normalize(request.email());
    if (tenantRepository.hasPersonalTenantForEmail(normalizedEmail)) {
      throw AuthException.conflict("Personal workspace already exists for this email");
    }

    var slug =
        TenantSlugGenerator.resolveUniqueSlug(
            "personal-" + UUID.randomUUID().toString().substring(0, 8), tenantRepository);

    var tenant = new SysTenant();
    tenant.setId(UUID.randomUUID());
    tenant.setName(PersonalTenantDefaults.DISPLAY_NAME);
    tenant.setSlug(slug);
    tenant.setPlan(DEFAULT_PLAN);
    tenant.setStatus("active");
    tenant.setTenantKind(TenantKind.PERSONAL);
    tenant.setCreatedAt(Instant.now());
    tenantRepository.insert(tenant);
    tenantRepository.seedFeatureCodes(tenant.getId(), PersonalTenantDefaults.FEATURE_CODES);

    var role =
        roleRepository
            .findByCode(MEMBER_ROLE)
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + MEMBER_ROLE));

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

    return new RegisterPersonalResponse(slug, PersonalTenantDefaults.DISPLAY_NAME);
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }
}
