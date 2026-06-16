package com.yunyan.saasapi.application.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSessionStore;
import com.yunyan.saasapi.application.auth.oidc.OidcClientKind;
import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryClient;
import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryDocument;
import com.yunyan.saasapi.application.auth.oidc.OidcPkceSupport;
import com.yunyan.saasapi.application.auth.oidc.OidcTokenClient;
import com.yunyan.saasapi.application.auth.oidc.OidcTokenClient.OidcTokenResponse;
import com.yunyan.saasapi.application.auth.oidc.OidcUserInfoClient;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import com.yunyan.saasapi.web.dto.auth.OidcCallbackRequest;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OidcAuthServiceTest {

  @Mock OidcAuthorizationSessionStore sessionStore;
  @Mock OidcDiscoveryClient discoveryClient;
  @Mock OidcTokenClient tokenClient;
  @Mock OidcUserInfoClient userInfoClient;
  @Mock AuthService authService;

  private final OidcPkceSupport pkceSupport = new OidcPkceSupport();
  private SaasAppProperties properties;
  private OidcAuthService service;

  @BeforeEach
  void setUp() {
    properties = new SaasAppProperties();
    service =
        new OidcAuthService(
            properties,
            sessionStore,
            pkceSupport,
            discoveryClient,
            tokenClient,
            userInfoClient,
            authService);
  }

  @Test
  void getProviders_whenDisabled_returnsEmptyProviders() {
    var response = service.getProviders();

    assertFalse(response.enabled());
    assertFalse(response.authorizationCodeFlowAvailable());
    assertEquals(0, response.providers().size());
  }

  @Test
  void getProviders_whenEnabledWithFlowReadyProvider_listsSummary() {
    enableGoogleProvider();

    var response = service.getProviders();

    assertTrue(response.enabled());
    assertTrue(response.authorizationCodeFlowAvailable());
    assertEquals(1, response.providers().size());
    assertEquals("google", response.providers().getFirst().id());
  }

  @Test
  void beginAuthorization_storesSessionAndReturnsUrl() {
    enableGoogleProvider();
    when(discoveryClient.discover("https://idp.example/"))
        .thenReturn(
            new OidcDiscoveryDocument(
                "https://idp.example/",
                "https://idp.example/authorize",
                "https://idp.example/token",
                "https://idp.example/userinfo"));

    var response = service.beginAuthorization("google", OidcClientKind.ADMIN, "test");

    assertTrue(response.authorizationUrl().startsWith("https://idp.example/authorize"));
    verify(sessionStore).store(any(), any());
  }

  @Test
  void completeCallback_exchangesCodeAndLogsInUser() {
    enableGoogleProvider();
    when(sessionStore.consume("state-1"))
        .thenReturn(
            Optional.of(
                new com.yunyan.saasapi.application.auth.oidc.OidcAuthorizationSession(
                    "state-1",
                    "verifier",
                    "google",
                    OidcClientKind.ADMIN,
                    "test",
                    "http://localhost:5181/auth/oidc/callback/google",
                    "nonce-1")));
    when(discoveryClient.discover("https://idp.example/"))
        .thenReturn(
            new OidcDiscoveryDocument(
                "https://idp.example/",
                "https://idp.example/authorize",
                "https://idp.example/token",
                "https://idp.example/userinfo"));
    when(tokenClient.exchangeAuthorizationCode(any(), any(), any(), eq("code-1"), eq("verifier")))
        .thenReturn(new OidcTokenResponse("access-token", null));
    when(userInfoClient.fetchVerifiedEmail("https://idp.example/userinfo", "access-token"))
        .thenReturn("platform@test.local");

    service.completeCallback("google", new OidcCallbackRequest("code-1", "state-1"));

    verify(authService).loginAfterOidc("platform@test.local", "test");
  }

  private void enableGoogleProvider() {
    var oauth2 = properties.getAuth().getOauth2();
    oauth2.setEnabled(true);
    var provider = new OAuth2Provider();
    provider.setId("google");
    provider.setDisplayName("Google");
    provider.setIssuerUri("https://idp.example/");
    provider.setClientId("client-id");
    provider.setClientSecret("client-secret");
    oauth2.getProviders().add(provider);
  }
}
