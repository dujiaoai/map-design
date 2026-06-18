package com.yunyan.saasapi.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.saml.SamlAssertionValidator;
import com.yunyan.saasapi.application.auth.saml.SamlAuthnRequestBuilder;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.SamlAcsRequest;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlAuthServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

  @Mock TenantRepository tenantRepository;
  @Mock TenantSamlConfigRepository samlConfigRepository;
  @Mock SaasAppProperties saasAppProperties;
  @Mock SamlAuthnRequestBuilder authnRequestBuilder;
  @Mock SamlAssertionValidator assertionValidator;
  @Mock AuthService authService;

  @InjectMocks TenantSamlAuthService service;

  @Test
  void beginAuth_buildsRedirectUrl() {
    var app = new SaasAppProperties.App();
    app.setWebBaseUrl("http://localhost:5175");
    when(saasAppProperties.getApp()).thenReturn(app);
    stubTenantAndConfig();
    when(authnRequestBuilder.buildRedirectUrl(anyString(), anyString(), anyString(), anyString()))
        .thenReturn("https://idp.example/sso?SAMLRequest=abc");

    var response = service.beginAuth("test");

    assertThat(response.authorizationUrl()).contains("idp.example");
    verify(authnRequestBuilder).buildRedirectUrl(anyString(), anyString(), anyString(), anyString());
  }

  @Test
  void completeAcs_logsInViaAuthService() {
    stubTenantAndConfig();
    when(assertionValidator.validate(eq("base64-response"), isNull()))
        .thenReturn(new SamlAssertionValidator.ParsedAssertion("user@test.local"));
    when(authService.loginAfterOidc(anyString(), anyString(), anyString(), eq("test")))
        .thenReturn(new LoginResponse("access", "refresh", 900L, null, null, false, null));

    var result =
        service.completeAcs("test", new SamlAcsRequest("base64-response", "relay"));

    assertThat(result.accessToken()).isEqualTo("access");
    verify(authService).loginAfterOidc(anyString(), eq("user@test.local"), eq("user@test.local"), eq("test"));
  }

  private void stubTenantAndConfig() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("test");
    when(tenantRepository.findBySlug("test")).thenReturn(Optional.of(tenant));

    var config = new TenantSamlConfig();
    config.setTenantId(TENANT_ID);
    config.setEnabled(true);
    config.setEntityId("https://idp.example/metadata");
    config.setSsoUrl("https://idp.example/sso");
    when(samlConfigRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(config));
  }
}
