package com.yunyan.saasapi.application.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import org.junit.jupiter.api.Test;

class OidcAuthServiceTest {

  @Test
  void getProviders_whenDisabled_returnsEmptyProviders() {
    var properties = new SaasAppProperties();
    var service = new OidcAuthService(properties);

    var response = service.getProviders();

    assertFalse(response.enabled());
    assertFalse(response.authorizationCodeFlowAvailable());
    assertEquals(0, response.providers().size());
  }

  @Test
  void getProviders_whenEnabledWithConfiguredProvider_listsSummary() {
    var properties = new SaasAppProperties();
    var oauth2 = properties.getAuth().getOauth2();
    oauth2.setEnabled(true);
    var provider = new OAuth2Provider();
    provider.setId("google");
    provider.setDisplayName("Google");
    provider.setIssuerUri("https://accounts.google.com");
    provider.setClientId("client-id");
    oauth2.getProviders().add(provider);

    var service = new OidcAuthService(properties);
    var response = service.getProviders();

    assertEquals(true, response.enabled());
    assertEquals(1, response.providers().size());
    assertEquals("google", response.providers().getFirst().id());
    assertEquals("Google", response.providers().getFirst().displayName());
  }
}
