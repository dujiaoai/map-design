package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.admin.AdminMfaService;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.security.mfa.MfaLoginChallengeStore;
import com.yunyan.saasapi.security.AccessTokenDenylist;
import com.yunyan.saasapi.security.JwtService;
import com.yunyan.saasapi.config.JwtProperties;
import com.yunyan.saasapi.security.RefreshRotationGraceStore;
import com.yunyan.saasapi.security.RefreshTokenStore;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import com.yunyan.saasapi.web.dto.auth.LoginMfaVerifyRequest;
import com.yunyan.saasapi.web.dto.auth.LoginRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.LoginUserDto;
import com.yunyan.saasapi.web.dto.auth.RefreshRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterResendRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterOrgResponse;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterPersonalResponse;
import com.yunyan.saasapi.web.dto.auth.RegisterRequest;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import com.yunyan.saasapi.application.email.EmailTokenHasher;
import com.yunyan.saasapi.application.email.PasswordResetService;
import com.yunyan.saasapi.application.email.RegistrationVerificationService;
import com.yunyan.saasapi.application.email.SecurityNotificationService;
import com.yunyan.saasapi.application.email.TenantInviteLinkService;
import com.yunyan.saasapi.application.email.UserInviteService;
import com.yunyan.saasapi.domain.EmailVerificationTokenRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.UserOauthBindRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.web.dto.auth.AcceptInviteRequest;
import com.yunyan.saasapi.web.dto.auth.ChangePasswordRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetRequest;
import com.yunyan.saasapi.web.dto.auth.JoinViaInviteLinkRequest;
import com.yunyan.saasapi.web.dto.auth.InviteLinkPreviewResponse;
import com.yunyan.saasapi.web.dto.auth.UpdateUserRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserAuthRepository userAuthRepository;
  private final UserOauthBindRepository userOauthBindRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenStore refreshTokenStore;
  private final RefreshRotationGraceStore refreshRotationGraceStore;
  private final AccessTokenDenylist accessTokenDenylist;
  private final JwtProperties jwtProperties;
  private final EmailTokenHasher emailTokenHasher;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final PasswordResetService passwordResetService;
  private final RegistrationVerificationService registrationVerificationService;
  private final OrgRegistrationService orgRegistrationService;
  private final PersonalRegistrationService personalRegistrationService;
  private final AuthRateLimitService authRateLimitService;
  private final SecurityNotificationService securityNotificationService;
  private final PasswordPolicyService passwordPolicyService;
  private final TenantInviteLinkService tenantInviteLinkService;
  private final TenantRepository tenantRepository;
  private final AdminMfaService adminMfaService;
  private final MfaLoginChallengeStore mfaLoginChallengeStore;
  private final SaasAppProperties saasAppProperties;

  private static final Duration MFA_LOGIN_CHALLENGE_TTL = Duration.ofMinutes(5);

  public void requestRegistration(RegisterRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    registrationVerificationService.requestRegistration(request);
  }

  public RegisterOrgResponse requestOrgRegistration(RegisterOrgRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    return orgRegistrationService.requestOrgRegistration(request);
  }

  public RegisterPersonalResponse requestPersonalRegistration(
      RegisterPersonalRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    return personalRegistrationService.requestPersonalRegistration(request);
  }

  public void resendRegistrationVerification(RegisterResendRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    registrationVerificationService.resendVerificationEmail(request.email(), request.tenantId());
  }

  @Transactional
  public LoginResponse confirmRegistration(RegisterConfirmRequest request) {
    var user = registrationVerificationService.confirmRegistration(request.token());
    userAuthRepository.touchLastLoginAt(user.id());
    return buildLoginResponse(user);
  }

  public LoginResponse login(LoginRequest request, String clientIp) {
    var normalizedEmail = EmailNormalizer.normalize(request.email());
    var tenantSlug = resolveTenantSlug(request);
    authRateLimitService.checkLogin(clientIp, normalizedEmail, tenantSlug);

    var lookup = userAuthRepository.lookupForLogin(normalizedEmail, tenantSlug);

    return switch (lookup.status()) {
      case TENANT_SUSPENDED -> throw AuthException.forbidden("Tenant is suspended");
      case TENANT_REQUIRED -> throw AuthException.badRequest("Tenant slug is required");
      case NOT_FOUND -> {
        authRateLimitService.recordLoginFailure(normalizedEmail, tenantSlug);
        throw AuthException.unauthorized("Invalid email or password");
      }
      case ACCOUNT_DISABLED -> {
        if (!passwordEncoder.matches(request.password(), lookup.user().passwordHash())) {
          authRateLimitService.recordLoginFailure(normalizedEmail, tenantSlug);
          throw AuthException.unauthorized("Invalid email or password");
        }
        throw AuthException.forbidden("Account is disabled");
      }
      case INVITE_PENDING ->
          throw AuthException.forbidden("Invite pending, check your email to set a password");
      case EMAIL_VERIFICATION_PENDING ->
          throw AuthException.forbidden("Email not verified, check your inbox to complete registration");
      case FOUND -> {
        if (!passwordEncoder.matches(request.password(), lookup.user().passwordHash())) {
          authRateLimitService.recordLoginFailure(normalizedEmail, tenantSlug);
          throw AuthException.unauthorized("Invalid email or password");
        }
        authRateLimitService.clearLoginFailures(normalizedEmail, tenantSlug);
        userAuthRepository.touchLastLoginAt(lookup.user().id());
        yield resolveLoginAfterPassword(lookup.user());
      }
    };
  }

  public LoginResponse verifyLoginMfa(LoginMfaVerifyRequest request) {
    var userId =
        mfaLoginChallengeStore
            .consume(request.mfaChallengeToken())
            .orElseThrow(() -> AuthException.unauthorized("MFA challenge expired or invalid"));
    if (!adminMfaService.verifyEnrolledCodeOrRecovery(userId, request.code())) {
      throw AuthException.unauthorized("Invalid TOTP or recovery code");
    }
    var user =
        userAuthRepository
            .findById(userId)
            .orElseThrow(() -> AuthException.unauthorized("User not found"));
    return buildLoginResponse(user);
  }

  public LoginResponse loginAfterOidc(
      String providerId, String providerSubject, String email, String tenantSlug) {
    var boundUserId =
        userOauthBindRepository.findUserIdByProviderSubject(providerId, providerSubject);
    if (boundUserId.isPresent()) {
      userOauthBindRepository.touchLastUsed(providerId, providerSubject);
      return finishOidcLogin(
          userAuthRepository.lookupForLoginByUserId(boundUserId.get(), tenantSlug));
    }
    var lookup = userAuthRepository.lookupForLogin(email, tenantSlug);
    return finishOidcLoginWithAutoBind(providerId, providerSubject, email, lookup);
  }

  private LoginResponse finishOidcLoginWithAutoBind(
      String providerId, String providerSubject, String email, LoginLookupResult lookup) {
    return switch (lookup.status()) {
      case TENANT_SUSPENDED -> throw AuthException.forbidden("Tenant is suspended");
      case TENANT_REQUIRED -> throw AuthException.badRequest("Tenant slug is required");
      case NOT_FOUND -> throw AuthException.unauthorized("No account linked for OIDC email");
      case ACCOUNT_DISABLED -> throw AuthException.forbidden("Account is disabled");
      case INVITE_PENDING ->
          throw AuthException.forbidden("Invite pending, check your email to set a password");
      case EMAIL_VERIFICATION_PENDING ->
          throw AuthException.forbidden("Email not verified, check your inbox to complete registration");
      case FOUND -> {
        userOauthBindRepository.bindUser(
            lookup.user().id(), providerId, providerSubject, email);
        userAuthRepository.touchLastLoginAt(lookup.user().id());
        yield resolveLoginAfterPassword(lookup.user());
      }
    };
  }

  private LoginResponse finishOidcLogin(LoginLookupResult lookup) {
    return switch (lookup.status()) {
      case TENANT_SUSPENDED -> throw AuthException.forbidden("Tenant is suspended");
      case TENANT_REQUIRED -> throw AuthException.badRequest("Tenant slug is required");
      case NOT_FOUND ->
          throw AuthException.unauthorized("OIDC account is not linked to this tenant");
      case ACCOUNT_DISABLED -> throw AuthException.forbidden("Account is disabled");
      case INVITE_PENDING ->
          throw AuthException.forbidden("Invite pending, check your email to set a password");
      case EMAIL_VERIFICATION_PENDING ->
          throw AuthException.forbidden("Email not verified, check your inbox to complete registration");
      case FOUND -> {
        userAuthRepository.touchLastLoginAt(lookup.user().id());
        yield resolveLoginAfterPassword(lookup.user());
      }
    };
  }

  private LoginResponse resolveLoginAfterPassword(AuthenticatedUser user) {
    if (!AdminMfaService.hasPlatformAdminAccess(user.permissionCodes())) {
      return buildLoginResponse(user);
    }
    if (saasAppProperties.getAuth().getAdminMfa().isEnforcementEnabled()
        && !adminMfaService.isEnrolled(user.id())) {
      throw AuthException.forbidden("Admin MFA enrollment required before login");
    }
    if (adminMfaService.isEnrolled(user.id())) {
      var challengeToken = UUID.randomUUID().toString();
      mfaLoginChallengeStore.store(challengeToken, user.id(), MFA_LOGIN_CHALLENGE_TTL);
      return buildMfaChallengeResponse(user, challengeToken);
    }
    return buildLoginResponse(user);
  }

  public AuthTokensDto refresh(RefreshRequest request) {
    if (!StringUtils.hasText(request.refreshToken())) {
      throw AuthException.badRequest("refreshToken is required");
    }

    var parsed = jwtService.parseRefreshToken(request.refreshToken());
    var gracePeriod = jwtProperties.effectiveRefreshGracePeriod();
    if (!gracePeriod.isZero() && !gracePeriod.isNegative()) {
      var graceHit = refreshRotationGraceStore.find(parsed.userId(), parsed.jti());
      if (graceHit.isPresent()) {
        return graceHit.get();
      }
    }

    if (!refreshTokenStore.revokeIfMatches(parsed.userId(), parsed.jti())) {
      if (!gracePeriod.isZero() && !gracePeriod.isNegative()) {
        return refreshRotationGraceStore
            .find(parsed.userId(), parsed.jti())
            .orElseThrow(() -> AuthException.unauthorized("Refresh token revoked or expired"));
      }
      throw AuthException.unauthorized("Refresh token revoked or expired");
    }

    var user = TenantContext.withTenant(
        parsed.tenantId().toString(),
        () -> userAuthRepository
            .findById(parsed.userId())
            .orElseThrow(() -> AuthException.unauthorized("User not found")));

    var tokens = issueTokens(user, parsed.actAsTenantId());
    if (!gracePeriod.isZero() && !gracePeriod.isNegative()) {
      refreshRotationGraceStore.store(parsed.userId(), parsed.jti(), tokens, gracePeriod);
    }
    return tokens;
  }

  public void logout(SaasPrincipal principal) {
    if (principal == null) {
      return;
    }
    logoutSession(principal.userId(), principal.accessTokenJti(), principal.accessTokenExpiresAt());
  }

  public void logoutSession(UUID userId, String accessTokenJti, Instant accessTokenExpiresAt) {
    refreshTokenStore.findActiveJti(userId).ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
    denyAccessToken(accessTokenJti, accessTokenExpiresAt);
  }

  private void denyAccessToken(String accessTokenJti, Instant accessTokenExpiresAt) {
    if (accessTokenJti == null || accessTokenJti.isBlank() || accessTokenExpiresAt == null) {
      return;
    }
    var ttl = Duration.between(Instant.now(), accessTokenExpiresAt);
    accessTokenDenylist.deny(accessTokenJti, ttl);
  }

  @Transactional
  public void changePassword(SaasPrincipal principal, ChangePasswordRequest request) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user = userAuthRepository
        .findById(principal.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));

    if (!passwordEncoder.matches(request.oldPassword(), user.passwordHash())) {
      throw AuthException.unauthorized("Current password is incorrect");
    }
    if (passwordEncoder.matches(request.newPassword(), user.passwordHash())) {
      throw AuthException.badRequest("New password must differ from current password");
    }

    passwordPolicyService.validateNewPassword(request.newPassword());
    userAuthRepository.updatePasswordHash(
        principal.userId(), passwordEncoder.encode(request.newPassword()));
    logout(principal);
    securityNotificationService.notifyPasswordChanged(
        principal.userId(), principal.tenantId(), user.email());
  }

  @Transactional
  public SessionDto updateCurrentUser(SaasPrincipal principal, UpdateUserRequest request) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var existing =
        TenantContext.withTenant(
            principal.tenantId().toString(),
            () ->
                userAuthRepository
                    .findById(principal.userId())
                    .orElseThrow(() -> AuthException.unauthorized("User not found")));
    var phone =
        request.phone() != null
            ? PhoneValidator.normalizeOptional(request.phone())
            : existing.phone();
    var avatarUrl =
        request.avatarUrl() != null
            ? normalizeOptionalText(request.avatarUrl())
            : existing.avatarUrl();
    var user =
        TenantContext.withTenant(
            principal.tenantId().toString(),
            () ->
                userAuthRepository.updateProfile(
                    principal.userId(), request.name().trim(), phone, avatarUrl));
    return toSessionDto(user, principal);
  }

  public SessionDto getCurrentSession(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user =
        TenantContext.withTenant(
            principal.tenantId().toString(),
            () ->
                userAuthRepository
                    .findById(principal.userId())
                    .orElseThrow(() -> AuthException.unauthorized("User not found")));
    return toSessionDto(user, principal);
  }

  private SessionDto toSessionDto(AuthenticatedUser user, SaasPrincipal principal) {
    var homeTenant =
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug());
    if (!principal.isImpersonating()) {
      return new SessionDto(
          toSessionUser(user),
          homeTenant,
          principal.accessTokenExpiresAt().toEpochMilli(),
          null);
    }
    var effective =
        tenantRepository
            .findById(principal.actAsTenantId())
            .orElseThrow(() -> AuthException.unauthorized("Impersonation tenant not found"));
    var effectiveTenant =
        new SessionTenantDto(
            effective.getId().toString(), effective.getName(), effective.getSlug());
    return new SessionDto(
        toSessionUser(user),
        effectiveTenant,
        principal.accessTokenExpiresAt().toEpochMilli(),
        homeTenant);
  }

  private static SessionUserDto toSessionUser(AuthenticatedUser user) {
    return new SessionUserDto(
        user.id().toString(),
        user.email(),
        user.displayName(),
        user.phone(),
        user.avatarUrl(),
        user.roleCodes(),
        user.permissionCodes());
  }

  public LoginResponse issueSessionTokens(AuthenticatedUser user, UUID actAsTenantId) {
    return issueSessionTokens(user, actAsTenantId, null);
  }

  public LoginResponse issueSessionTokens(
      AuthenticatedUser user, UUID actAsTenantId, SaasPrincipal replacePrior) {
    if (replacePrior != null) {
      denyAccessToken(replacePrior.accessTokenJti(), replacePrior.accessTokenExpiresAt());
      refreshTokenStore
          .findActiveJti(replacePrior.userId())
          .ifPresent(jti -> refreshTokenStore.revoke(replacePrior.userId(), jti));
    }
    return buildLoginResponse(user, actAsTenantId);
  }

  @Transactional
  public LoginResponse acceptInvite(AcceptInviteRequest request) {
    var hash = emailTokenHasher.hash(request.token().trim());
    var token =
        emailVerificationTokenRepository
            .findActiveInviteByHash(hash)
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired invite link"));

    var user =
        userRepository
            .findById(token.getUserId())
            .orElseThrow(() -> AuthException.badRequest("Invalid or expired invite link"));
    if (!UserInviteService.STATUS_INVITED.equals(user.getStatus())) {
      throw AuthException.badRequest("Invite already accepted");
    }
    if (passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw AuthException.badRequest("New password must differ from current password");
    }

    passwordPolicyService.validateNewPassword(request.password());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setStatus("active");
    userRepository.update(user);
    emailVerificationTokenRepository.consume(token.getId());

    var authUser =
        userAuthRepository
            .findById(user.getId())
            .orElseThrow(() -> new IllegalStateException("User not found after invite accept"));
    userAuthRepository.touchLastLoginAt(user.getId());
    return buildLoginResponse(authUser);
  }

  public InviteLinkPreviewResponse previewInviteLink(String token) {
    return tenantInviteLinkService.preview(token);
  }

  @Transactional
  public LoginResponse joinViaInviteLink(JoinViaInviteLinkRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    var user = tenantInviteLinkService.joinViaInviteLink(request);
    userAuthRepository.touchLastLoginAt(user.id());
    return buildLoginResponse(user);
  }

  public void requestPasswordReset(PasswordResetRequest request, String clientIp) {
    authRateLimitService.checkPasswordResetRequest(clientIp, request.email(), request.tenantId());
    passwordResetService.requestPasswordReset(
        request.email(), request.tenantId(), request.clientApp());
  }

  @Transactional
  public LoginResponse confirmPasswordReset(PasswordResetConfirmRequest request) {
    var user = passwordResetService.confirmPasswordReset(request.token(), request.password());
    userAuthRepository.touchLastLoginAt(user.id());
    securityNotificationService.notifyPasswordChanged(
        user.id(), user.tenantId(), user.email());
    return buildLoginResponse(user);
  }

  private LoginResponse buildLoginResponse(AuthenticatedUser user) {
    return buildLoginResponse(user, null);
  }

  private LoginResponse buildLoginResponse(AuthenticatedUser user, UUID actAsTenantId) {
    var tokens = issueTokens(user, actAsTenantId);
    var homeTenant =
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug());
    SessionTenantDto effectiveTenant = homeTenant;
    SessionTenantDto responseHomeTenant = null;
    if (actAsTenantId != null) {
      var tenant =
          tenantRepository
              .findById(actAsTenantId)
              .orElseThrow(() -> AuthException.badRequest("Tenant not found"));
      effectiveTenant =
          new SessionTenantDto(tenant.getId().toString(), tenant.getName(), tenant.getSlug());
      responseHomeTenant = homeTenant;
    }
    var loginUser = new LoginUserDto(
        user.id().toString(),
        user.email(),
        user.displayName(),
        user.phone(),
        user.avatarUrl(),
        user.roleCodes(),
        user.permissionCodes(),
        effectiveTenant);
    return new LoginResponse(
        tokens.accessToken(),
        tokens.refreshToken(),
        tokens.expiresIn(),
        loginUser,
        responseHomeTenant,
        null,
        null);
  }

  private LoginResponse buildMfaChallengeResponse(AuthenticatedUser user, String challengeToken) {
    var homeTenant =
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug());
    var loginUser =
        new LoginUserDto(
            user.id().toString(),
            user.email(),
            user.displayName(),
            user.phone(),
            user.avatarUrl(),
            user.roleCodes(),
            user.permissionCodes(),
            homeTenant);
    return new LoginResponse(null, null, 0, loginUser, null, true, challengeToken);
  }

  private AuthTokensDto issueTokens(AuthenticatedUser user) {
    return issueTokens(user, null);
  }

  private AuthTokensDto issueTokens(AuthenticatedUser user, UUID actAsTenantId) {
    // 账号曾禁用时写入的 user 级 denylist 可能仍残留；成功签发新 token 即视为可登录
    accessTokenDenylist.clearUserDeny(user.id());
    var access = jwtService.issueAccessToken(user, actAsTenantId);
    var refresh = jwtService.issueRefreshToken(user, actAsTenantId);
    var refreshTtl = Duration.between(java.time.Instant.now(), refresh.expiresAt());
    if (refreshTtl.isNegative()) {
      refreshTtl = Duration.ZERO;
    }
    refreshTokenStore.store(user.id(), refresh.jti(), refreshTtl);
    return new AuthTokensDto(
        access.token(), refresh.token(), jwtService.accessExpiresInSeconds());
  }

  private String resolveTenantSlug(LoginRequest request) {
    if (!StringUtils.hasText(request.tenantId())) {
      return null;
    }
    return request.tenantId().trim();
  }

  private static String normalizeOptionalText(String value) {
    if (value == null) {
      return null;
    }
    var trimmed = value.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
