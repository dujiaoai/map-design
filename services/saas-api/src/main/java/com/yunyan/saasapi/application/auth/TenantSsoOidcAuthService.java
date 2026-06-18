package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSession;
import com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSessionStore;
import com.yunyan.saasapi.application.auth.oidc.OidcClientKind;
import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryClient;
import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryDocument;
import com.yunyan.saasapi.application.auth.oidc.OidcPkceSupport;
import com.yunyan.saasapi.application.auth.oidc.OidcTokenClient;
import com.yunyan.saasapi.application.auth.oidc.OidcUserInfoClient;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantOidcConfigRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantOidcConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.OidcCallbackRequest;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class TenantSsoOidcAuthService {

  private static final Duration AUTHORIZATION_SESSION_TTL = Duration.ofMinutes(10);

  private final TenantRepository tenantRepository;
  private final TenantOidcConfigRepository oidcConfigRepository;
  private final SaasAppProperties saasAppProperties;
  private final OidcAuthorizationSessionStore oidcAuthorizationSessionStore;
  private final OidcPkceSupport oidcPkceSupport;
  private final OidcDiscoveryClient oidcDiscoveryClient;
  private final OidcTokenClient oidcTokenClient;
  private final OidcUserInfoClient oidcUserInfoClient;
  private final AuthService authService;

  public OidcAuthorizeResponse beginAuthorization(String slug) {
    var normalized = requireSlug(slug);
    var config = requireFlowReadyConfig(normalized);
    var discovery = resolveDiscovery(config);
    var providerId = TenantSsoOidcSupport.providerId(normalized);
    var redirectUri = callbackUri(normalized);
    var state = oidcPkceSupport.randomState();
    var codeVerifier = oidcPkceSupport.generateCodeVerifier();
    var codeChallenge = oidcPkceSupport.codeChallengeS256(codeVerifier);
    var nonce = oidcPkceSupport.randomNonce();
    oidcAuthorizationSessionStore.store(
        new OidcAuthorizationSession(
            state, codeVerifier, providerId, OidcClientKind.WEB, normalized, redirectUri, nonce),
        AUTHORIZATION_SESSION_TTL);
    var scopes = String.join(" ", TenantSsoOidcSupport.resolveScopes(config.getScopes()));
    var authorizationUrl =
        UriComponentsBuilder.fromUriString(discovery.authorizationEndpoint())
            .queryParam("response_type", "code")
            .queryParam("client_id", config.getClientId())
            .queryParam("redirect_uri", redirectUri)
            .queryParam("scope", scopes)
            .queryParam("state", state)
            .queryParam("code_challenge", codeChallenge)
            .queryParam("code_challenge_method", "S256")
            .queryParam("nonce", nonce)
            .build(false)
            .toUriString();
    return new OidcAuthorizeResponse(authorizationUrl, state);
  }

  public LoginResponse completeCallback(String slug, OidcCallbackRequest request) {
    var normalized = requireSlug(slug);
    var providerId = TenantSsoOidcSupport.providerId(normalized);
    var session =
        oidcAuthorizationSessionStore
            .consume(request.state())
            .orElseThrow(() -> AuthException.unauthorized("OIDC state expired or invalid"));
    if (!session.providerId().equals(providerId)) {
      throw AuthException.unauthorized("OIDC provider mismatch");
    }
    if (!normalized.equals(session.tenantSlug())) {
      throw AuthException.unauthorized("Tenant slug mismatch");
    }
    var config = requireFlowReadyConfig(normalized);
    var discovery = resolveDiscovery(config);
    var token =
        oidcTokenClient.exchangeAuthorizationCode(
            config.getClientId(),
            config.getClientSecret(),
            discovery,
            session.redirectUri(),
            request.code(),
            session.codeVerifier());
    var userInfo =
        oidcUserInfoClient.fetchUserInfo(discovery.userinfoEndpoint(), token.accessToken());
    return authService.loginAfterOidc(
        providerId, userInfo.subject(), userInfo.email(), normalized);
  }

  private TenantOidcConfig requireFlowReadyConfig(String slug) {
    var tenant =
        tenantRepository
            .findBySlug(slug)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        oidcConfigRepository
            .findByTenantId(tenant.getId())
            .orElseThrow(() -> AuthException.badRequest("Tenant SSO is not configured"));
    if (!Boolean.TRUE.equals(config.getEnabled()) || !isFlowReady(config)) {
      throw AuthException.badRequest("Tenant SSO authorization flow is not available");
    }
    return config;
  }

  private static boolean isFlowReady(TenantOidcConfig config) {
    return StringUtils.hasText(config.getIssuerUri())
        && StringUtils.hasText(config.getClientId())
        && StringUtils.hasText(config.getClientSecret());
  }

  private OidcDiscoveryDocument resolveDiscovery(TenantOidcConfig config) {
    if (StringUtils.hasText(config.getAuthorizationEndpoint())
        && StringUtils.hasText(config.getTokenEndpoint())) {
      return new OidcDiscoveryDocument(
          config.getIssuerUri(),
          config.getAuthorizationEndpoint(),
          config.getTokenEndpoint(),
          config.getUserinfoEndpoint());
    }
    return oidcDiscoveryClient.discover(config.getIssuerUri());
  }

  private String callbackUri(String slug) {
    return trimTrailingSlash(saasAppProperties.getApp().getWebBaseUrl())
        + "/auth/tenant-sso/callback/"
        + slug;
  }

  private static String requireSlug(String slug) {
    var normalized = slug == null ? "" : slug.trim();
    if (!StringUtils.hasText(normalized)) {
      throw AuthException.badRequest("Tenant slug is required");
    }
    return normalized;
  }

  private static String trimTrailingSlash(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }
}
