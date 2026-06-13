package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.application.auth.AuthenticatedUser;
import com.yunyan.saasapi.application.auth.EmailNormalizer;
import com.yunyan.saasapi.application.auth.PasswordPolicyService;
import com.yunyan.saasapi.application.auth.UserAuthRepository;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.EmailVerificationTokenRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.domain.entity.SysEmailVerificationToken;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.SysUser;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.RefreshTokenStore;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

  private static final String STATUS_ACTIVE = "active";

  private final TenantRepository tenantRepository;
  private final UserRepository userRepository;
  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailTokenHasher emailTokenHasher;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final EmailDeliveryService emailDeliveryService;
  private final RefreshTokenStore refreshTokenStore;
  private final SaasAppProperties saasAppProperties;
  private final PasswordPolicyService passwordPolicyService;

  @Transactional
  public void requestPasswordReset(String email, String tenantSlug, String clientApp) {
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
    if (user == null || !STATUS_ACTIVE.equals(user.getStatus())) {
      return;
    }

    emailVerificationTokenRepository.invalidateActivePasswordResetTokens(user.getId());
    sendPasswordResetEmail(tenant, user, clientApp);
  }

  @Transactional
  public AuthenticatedUser confirmPasswordReset(String rawToken, String newPassword) {
    var hash = emailTokenHasher.hash(rawToken.trim());
    var token =
        emailVerificationTokenRepository
            .findActivePasswordResetByHash(hash)
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired reset link"));

    var user =
        userRepository
            .findById(token.getUserId())
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired reset link"));
    if (!STATUS_ACTIVE.equals(user.getStatus())) {
      throw AuthException.badRequest("Invalid or expired reset link");
    }
    if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
      throw AuthException.badRequest("New password must differ from current password");
    }

    passwordPolicyService.validateNewPassword(newPassword);
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.update(user);
    emailVerificationTokenRepository.consume(token.getId());
    refreshTokenStore
        .findActiveJti(user.getId())
        .ifPresent(jti -> refreshTokenStore.revoke(user.getId(), jti));

    return userAuthRepository
        .findById(user.getId())
        .orElseThrow(() -> new IllegalStateException("User not found after password reset"));
  }

  private void sendPasswordResetEmail(SysTenant tenant, SysUser user, String clientApp) {
    var rawToken = emailTokenHasher.generateRawToken();
    var token = new SysEmailVerificationToken();
    token.setId(UUID.randomUUID());
    token.setUserId(user.getId());
    token.setPurpose(EmailVerificationTokenRepository.PURPOSE_PASSWORD_RESET);
    token.setTokenHash(emailTokenHasher.hash(rawToken));
    token.setExpiresAt(Instant.now().plus(saasAppProperties.getPasswordReset().getTokenTtl()));
    token.setCreatedAt(Instant.now());
    emailVerificationTokenRepository.insert(token);

    var baseUrl = resolveResetBaseUrl(clientApp);
    var resetUrl =
        baseUrl.replaceAll("/$", "") + "/reset-password?token=" + rawToken;
    emailDeliveryService.queuePasswordResetEmail(
        tenant.getId(), user.getId(), user.getEmail(), tenant.getName(), resetUrl);
  }

  private String resolveResetBaseUrl(String clientApp) {
    if (StringUtils.hasText(clientApp) && "admin".equalsIgnoreCase(clientApp.trim())) {
      return saasAppProperties.getApp().getAdminBaseUrl();
    }
    return saasAppProperties.getApp().getWebBaseUrl();
  }

  private static boolean isTenantActive(SysTenant tenant) {
    return tenant.getStatus() == null || STATUS_ACTIVE.equals(tenant.getStatus());
  }
}
