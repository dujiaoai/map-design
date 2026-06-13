package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.application.auth.PasswordPolicyService;
import com.yunyan.saasapi.application.auth.UserAuthRepository;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.EmailVerificationTokenRepository;
import com.yunyan.saasapi.domain.RoleRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysEmailVerificationToken;
import com.yunyan.saasapi.domain.entity.SysRole;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.RegisterRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class RegistrationVerificationService {

  public static final String STATUS_UNVERIFIED = "unverified";
  private static final String STATUS_ACTIVE = "active";
  private static final String DEFAULT_ROLE = "MEMBER";

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailTokenHasher emailTokenHasher;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final EmailDeliveryService emailDeliveryService;
  private final SaasAppProperties saasAppProperties;
  private final PasswordPolicyService passwordPolicyService;

  @Transactional
  public void requestRegistration(RegisterRequest request) {
    passwordPolicyService.validateNewPassword(request.password());
    var tenantSlug = request.tenantId().trim();
    var tenant =
        tenantRepository
            .findBySlug(tenantSlug)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    if (!isTenantActive(tenant)) {
      throw AuthException.forbidden("Tenant is suspended");
    }

    var normalizedEmail = EmailNormalizer.normalize(request.email());
    var existing = userRepository.findByTenantIdAndEmail(tenant.getId(), normalizedEmail);
    if (existing.isPresent()) {
      var user = existing.get();
      if (STATUS_UNVERIFIED.equals(user.getStatus())) {
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(resolveDisplayName(normalizedEmail, request.displayName()));
        userRepository.update(user);
        emailVerificationTokenRepository.invalidateActiveRegisterTokens(user.getId());
        sendVerificationEmail(tenant, user);
        return;
      }
      throw AuthException.conflict("Email already registered for this tenant");
    }

    var role =
        roleRepository
            .findByCode(DEFAULT_ROLE)
            .orElseThrow(() -> new IllegalStateException("Role is not seeded: " + DEFAULT_ROLE));

    var user = new SysUser();
    user.setId(UUID.randomUUID());
    user.setTenantId(tenant.getId());
    user.setEmail(normalizedEmail);
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setDisplayName(resolveDisplayName(normalizedEmail, request.displayName()));
    user.setStatus(STATUS_UNVERIFIED);
    user.setCreatedAt(Instant.now());
    userRepository.insert(user);
    userRepository.insertUserRole(user.getId(), role.getId());

    sendVerificationEmail(tenant, user);
  }

  /** 为新组织首个管理员发送注册验证邮件。 */
  public void sendRegistrationVerification(SysTenant tenant, SysUser user) {
    emailVerificationTokenRepository.invalidateActiveRegisterTokens(user.getId());
    sendVerificationEmail(tenant, user);
  }

  @Transactional
  public AuthenticatedUser confirmRegistration(String rawToken) {
    var hash = emailTokenHasher.hash(rawToken.trim());
    var token =
        emailVerificationTokenRepository
            .findActiveRegisterByHash(hash)
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired verification link"));

    var user =
        userRepository
            .findById(token.getUserId())
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired verification link"));
    if (!STATUS_UNVERIFIED.equals(user.getStatus())) {
      throw AuthException.badRequest("Email already verified");
    }

    user.setStatus(STATUS_ACTIVE);
    userRepository.update(user);
    emailVerificationTokenRepository.consume(token.getId());

    return userAuthRepository
        .findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("User not found after registration confirm"));
  }

  /** 对待验证账号重发验证邮件；不存在或非 unverified 时静默忽略（防枚举）。 */
  @Transactional
  public void resendVerificationEmail(String email, String tenantSlug) {
    if (!StringUtils.hasText(email) || !StringUtils.hasText(tenantSlug)) {
      return;
    }

    var tenant = tenantRepository.findBySlug(tenantSlug.trim()).orElse(null);
    if (tenant == null || !isTenantActive(tenant)) {
      return;
    }

    var normalizedEmail = EmailNormalizer.normalize(email);
    var user =
        userRepository.findByTenantIdAndEmail(tenant.getId(), normalizedEmail).orElse(null);
    if (user == null || !STATUS_UNVERIFIED.equals(user.getStatus())) {
      return;
    }

    emailVerificationTokenRepository.invalidateActiveRegisterTokens(user.getId());
    sendVerificationEmail(tenant, user);
  }

  private void sendVerificationEmail(SysTenant tenant, SysUser user) {
    var rawToken = emailTokenHasher.generateRawToken();
    var token = new SysEmailVerificationToken();
    token.setId(UUID.randomUUID());
    token.setUserId(user.getId());
    token.setPurpose(EmailVerificationTokenRepository.PURPOSE_REGISTER);
    token.setTokenHash(emailTokenHasher.hash(rawToken));
    token.setExpiresAt(Instant.now().plus(saasAppProperties.getRegistration().getTokenTtl()));
    token.setCreatedAt(Instant.now());
    emailVerificationTokenRepository.insert(token);

    var verifyUrl =
        saasAppProperties.getApp().getWebBaseUrl().replaceAll("/$", "")
            + "/verify-email?token="
            + rawToken;
    emailDeliveryService.queueRegisterVerificationEmail(
        tenant.getId(), user.getId(), user.getEmail(), tenant.getName(), verifyUrl);
  }

  private static boolean isTenantActive(SysTenant tenant) {
    return tenant.getStatus() == null || STATUS_ACTIVE.equals(tenant.getStatus());
  }

  private static String resolveDisplayName(String email, String displayName) {
    if (StringUtils.hasText(displayName)) {
      return displayName.trim();
    }
    var at = email.indexOf('@');
    return at > 0 ? email.substring(0, at) : email;
  }
}
