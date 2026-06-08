package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.JwtService;
import com.yunyan.saasapi.security.RefreshTokenStore;
import com.yunyan.saasapi.web.dto.auth.AuthTokensDto;
import com.yunyan.saasapi.web.dto.auth.LoginRequest;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.LoginUserDto;
import com.yunyan.saasapi.web.dto.auth.RefreshRequest;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.auth.SessionDto;
import com.yunyan.saasapi.web.dto.auth.SessionTenantDto;
import com.yunyan.saasapi.web.dto.auth.SessionUserDto;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserAuthRepository userAuthRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenStore refreshTokenStore;

  public LoginResponse login(LoginRequest request) {
    var user = userAuthRepository
        .findForLogin(request.email(), resolveTenantSlug(request))
        .orElseThrow(() -> AuthException.unauthorized("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
      throw AuthException.unauthorized("Invalid email or password");
    }

    return buildLoginResponse(user);
  }

  public AuthTokensDto refresh(RefreshRequest request) {
    if (!StringUtils.hasText(request.refreshToken())) {
      throw AuthException.badRequest("refreshToken is required");
    }

    var parsed = jwtService.parseRefreshToken(request.refreshToken());
    if (!refreshTokenStore.isActive(parsed.userId(), parsed.jti())) {
      throw AuthException.unauthorized("Refresh token revoked or expired");
    }

    var user = userAuthRepository
        .findById(parsed.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));

    refreshTokenStore.revoke(parsed.userId(), parsed.jti());
    return issueTokens(user);
  }

  public void logout(UUID userId) {
    refreshTokenStore.findActiveJti(userId).ifPresent(jti -> refreshTokenStore.revoke(userId, jti));
  }

  public SessionDto getCurrentSession(SaasPrincipal principal) {
    if (principal == null) {
      throw AuthException.unauthorized("Not authenticated");
    }
    var user = userAuthRepository
        .findById(principal.userId())
        .orElseThrow(() -> AuthException.unauthorized("User not found"));
    return toSessionDto(user);
  }

  private LoginResponse buildLoginResponse(AuthenticatedUser user) {
    var tokens = issueTokens(user);
    var loginUser = new LoginUserDto(
        user.id().toString(),
        user.email(),
        user.displayName(),
        user.roleCodes(),
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

  private SessionDto toSessionDto(AuthenticatedUser user) {
    return new SessionDto(
        new SessionUserDto(
            user.id().toString(),
            user.email(),
            user.displayName(),
            user.roleCodes()),
        new SessionTenantDto(user.tenantId().toString(), user.tenantName(), user.tenantSlug()),
        0);
  }
}
