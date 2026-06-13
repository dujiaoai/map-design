package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.JwtService;
import com.yunyan.saasapi.config.JwtProperties;
import com.yunyan.saasapi.security.RefreshRotationGraceStore;
import com.yunyan.saasapi.security.RefreshTokenStore;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import com.yunyan.saasapi.web.dto.auth.LoginRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.LoginUserDto;
import com.yunyan.saasapi.web.dto.auth.RefreshRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.RegisterRequest;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.security.TenantContext;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import com.yunyan.saasapi.application.email.EmailTokenHasher;
import com.yunyan.saasapi.application.email.PasswordResetService;
import com.yunyan.saasapi.application.email.RegistrationVerificationService;
import com.yunyan.saasapi.application.email.UserInviteService;
import com.yunyan.saasapi.domain.EmailVerificationTokenRepository;
import com.yunyan.saasapi.domain.UserRepository;
import com.yunyan.saasapi.web.dto.auth.AcceptInviteRequest;
import com.yunyan.saasapi.web.dto.auth.ChangePasswordRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetConfirmRequest;
import com.yunyan.saasapi.web.dto.auth.PasswordResetRequest;
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
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenStore refreshTokenStore;
  private final RefreshRotationGraceStore refreshRotationGraceStore;
  private final JwtProperties jwtProperties;
  private final EmailTokenHasher emailTokenHasher;
  private final EmailVerificationTokenRepository emailVerificationTokenRepository;
  private final PasswordResetService passwordResetService;
  private final RegistrationVerificationService registrationVerificationService;
  private final AuthRateLimitService authRateLimitService;

  public void requestRegistration(RegisterRequest request, String clientIp) {
    authRateLimitService.checkRegister(clientIp, request.email());
    registrationVerificationService.requestRegistration(request);
  }

  @Transactional
  public LoginResponse confirmRegistration(RegisterConfirmRequest request) {
    var user = registrationVerificationService.confirmRegistration(request.token());
    userAuthRepository.touchLastLoginAt(user.id());
    return buildLoginResponse(user);
  }

  public LoginResponse login(LoginRequest request, String clientIp) {
    var tenantSlug = resolveTenantSlug(request);
    authRateLimitService.checkLogin(clientIp, request.email(), tenantSlug);

    var lookup = userAuthRepository.lookupForLogin(request.email(), tenantSlug);

    return switch (lookup.status()) {
      case TENANT_SUSPENDED -> throw AuthException.forbidden("Tenant is suspended");
      case NOT_FOUND -> {
        authRateLimitService.recordLoginFailure(request.email(), tenantSlug);
        throw AuthException.unauthorized("Invalid email or password");
      }
      case ACCOUNT_DISABLED -> {
        if (!passwordEncoder.matches(request.password(), lookup.user().passwordHash())) {
          authRateLimitService.recordLoginFailure(request.email(), tenantSlug);
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
          authRateLimitService.recordLoginFailure(request.email(), tenantSlug);
          throw AuthException.unauthorized("Invalid email or password");
        }
        authRateLimitService.clearLoginFailures(request.email(), tenantSlug);
        userAuthRepository.touchLastLoginAt(lookup.user().id());
        yield buildLoginResponse(lookup.user());
      }
    };
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

    var tokens = issueTokens(user);
    if (!gracePeriod.isZero() && !gracePeriod.isNegative()) {
      refreshRotationGraceStore.store(parsed.userId(), parsed.jti(), tokens, gracePeriod);
    }
    return tokens;
  }

  public void logout(UUID userId) {
    refreshTokenStore.findActiveJti(userId).ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
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

    userAuthRepository.updatePasswordHash(
        principal.userId(), passwordEncoder.encode(request.newPassword()));
    logout(principal.userId());
  }

  @Transactional
  public SessionDto updateCurrentUser(SaasPrincipal principal, UpdateUserRequest request) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user = userAuthRepository.updateDisplayName(principal.userId(), request.name().trim());
    return toSessionDto(user, principal.accessTokenExpiresAt());
  }

  public SessionDto getCurrentSession(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user = userAuthRepository
        .findById(principal.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));
    return toSessionDto(user, principal.accessTokenExpiresAt());
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

  public void requestPasswordReset(PasswordResetRequest request, String clientIp) {
    authRateLimitService.checkPasswordResetRequest(clientIp, request.email(), request.tenantId());
    passwordResetService.requestPasswordReset(request.email(), request.tenantId());
  }

  @Transactional
  public LoginResponse confirmPasswordReset(PasswordResetConfirmRequest request) {
    var user = passwordResetService.confirmPasswordReset(request.token(), request.password());
    userAuthRepository.touchLastLoginAt(user.id());
    return buildLoginResponse(user);
  }

  private LoginResponse buildLoginResponse(AuthenticatedUser user) {
    var tokens = issueTokens(user);
    var loginUser = new LoginUserDto(
        user.id().toString(),
        user.email(),
        user.displayName(),
        user.roleCodes(),
        user.permissionCodes(),
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug()));
    return new LoginResponse(
        tokens.accessToken(), tokens.refreshToken(), tokens.expiresIn(), loginUser);
  }

  private AuthTokensDto issueTokens(AuthenticatedUser user) {
    var access = jwtService.issueAccessToken(user);
    var refresh = jwtService.issueRefreshToken(user);
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

  private SessionDto toSessionDto(AuthenticatedUser user, Instant accessTokenExpiresAt) {
    return new SessionDto(
        new SessionUserDto(
            user.id().toString(),
            user.email(),
            user.displayName(),
            user.roleCodes(),
            user.permissionCodes()),
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug()),
        accessTokenExpiresAt.toEpochMilli());
  }
}
