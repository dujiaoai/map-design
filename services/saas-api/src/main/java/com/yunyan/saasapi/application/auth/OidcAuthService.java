package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSession;
import com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSessionStore;
import com.yunyan.saasapi.application.auth.oidc.OidcClientKind;
import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryClient;
import com.yunyan.saasapi.application.auth.oidc.OidcPkceSupport;
import com.yunyan.saasapi.application.auth.oidc.OidcTokenClient;
import com.yunyan.saasapi.application.auth.oidc.OidcUserInfoClient;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.OidcCallbackRequest;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse;
import com.yunyan.saasapi.web.dto.auth.OidcProvidersResponse.OidcProviderSummary;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class OidcAuthService {

  private static final Duration AUTHORIZATION_SESSION_TTL = Duration.ofMinutes(10);

  private final SaasAppProperties saasAppProperties;
  private final OidcAuthorizationSessionStore oidcAuthorizationSessionStore;
  private final OidcPkceSupport oidcPkceSupport;
  private final OidcDiscoveryClient oidcDiscoveryClient;
  private final OidcTokenClient oidcTokenClient;
  private final OidcUserInfoClient oidcUserInfoClient;
  private final AuthService authService;

  public OidcProvidersResponse getProviders() {
    var oauth2 = saasAppProperties.getAuth().getOauth2();
    var flowReady = flowReadyProviders(oauth2.getProviders());
    var enabled = oauth2.isEnabled() && !flowReady.isEmpty();
    return new OidcProvidersResponse(
        enabled,
        enabled,
        flowReady.stream()
            .map(provider -> new OidcProviderSummary(provider.getId(), provider.getDisplayName()))
            .toList());
  }

  public int countConfiguredProviders() {
    return flowReadyProviders(saasAppProperties.getAuth().getOauth2().getProviders()).size();
  }

  public boolean isEnabled() {
    var oauth2 = saasAppProperties.getAuth().getOauth2();
    return oauth2.isEnabled() && !flowReadyProviders(oauth2.getProviders()).isEmpty();
  }

  public boolean isAuthorizationCodeFlowAvailable() {
    return isEnabled();
  }

  public OidcAuthorizeResponse beginAuthorization(
      String providerId, OidcClientKind clientKind, String tenantSlug) {
    assertFlowEnabled();
    if (!StringUtils.hasText(tenantSlug)) {
      throw AuthException.badRequest("tenantId is required for OIDC login");
    }
    var provider = requireFlowReadyProvider(providerId);
    var discovery = oidcDiscoveryClient.discover(provider.getIssuerUri());
    var redirectUri = callbackUri(provider, clientKind);
    var state = oidcPkceSupport.randomState();
    var codeVerifier = oidcPkceSupport.generateCodeVerifier();
    var codeChallenge = oidcPkceSupport.codeChallengeS256(codeVerifier);
    var nonce = oidcPkceSupport.randomNonce();
    oidcAuthorizationSessionStore.store(
        new OidcAuthorizationSession(
            state, codeVerifier, provider.getId(), clientKind, tenantSlug.trim(), redirectUri, nonce),
        AUTHORIZATION_SESSION_TTL);
    var scopes = String.join(" ", provider.getScopes());
    var authorizationUrl =
        UriComponentsBuilder.fromUriString(discovery.authorizationEndpoint())
            .queryParam("response_type", "code")
            .queryParam("client_id", provider.getClientId())
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

  public LoginResponse completeCallback(String providerId, OidcCallbackRequest request) {
    assertFlowEnabled();
    var session =
        oidcAuthorizationSessionStore
            .consume(request.state())
            .orElseThrow(() -> AuthException.unauthorized("OIDC state expired or invalid"));
    if (!session.providerId().equals(providerId)) {
      throw AuthException.unauthorized("OIDC provider mismatch");
    }
    var provider = requireFlowReadyProvider(providerId);
    var discovery = oidcDiscoveryClient.discover(provider.getIssuerUri());
    var token =
        oidcTokenClient.exchangeAuthorizationCode(
            provider, discovery, session.redirectUri(), request.code(), session.codeVerifier());
    var email = oidcUserInfoClient.fetchVerifiedEmail(discovery.userinfoEndpoint(), token.accessToken());
    return authService.loginAfterOidc(email, session.tenantSlug());
  }

  private void assertFlowEnabled() {
    if (!isAuthorizationCodeFlowAvailable()) {
      throw AuthException.badRequest("OIDC authorization code flow is not enabled");
    }
  }

  private OAuth2Provider requireFlowReadyProvider(String providerId) {
    return flowReadyProviders(saasAppProperties.getAuth().getOauth2().getProviders()).stream()
        .filter(provider -> provider.getId().equals(providerId))
        .findFirst()
        .orElseThrow(() -> AuthException.notFound("OIDC provider not found"));
  }

  private String callbackUri(OAuth2Provider provider, OidcClientKind clientKind) {
    var base =
        clientKind == OidcClientKind.ADMIN
            ? saasAppProperties.getApp().getAdminBaseUrl()
            : saasAppProperties.getApp().getWebBaseUrl();
    return trimTrailingSlash(base) + "/auth/oidc/callback/" + provider.getId();
  }

  private static String trimTrailingSlash(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }

  private static List<OAuth2Provider> flowReadyProviders(List<OAuth2Provider> providers) {
    if (providers == null || providers.isEmpty()) {
      return List.of();
    }
    return providers.stream().filter(OidcAuthService::isFlowReady).toList();
  }

  private static boolean isFlowReady(OAuth2Provider provider) {
    return provider != null
        && StringUtils.hasText(provider.getId())
        && StringUtils.hasText(provider.getDisplayName())
        && StringUtils.hasText(provider.getIssuerUri())
        && StringUtils.hasText(provider.getClientId())
        && StringUtils.hasText(provider.getClientSecret())
        && provider.getScopes() != null
        && !provider.getScopes().isEmpty();
  }
}
