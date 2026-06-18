package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;

import com.yunyan.saasapi.application.auth.TenantSsoOidcSupport;
import org.junit.jupiter.api.Test;

class TenantSsoOidcSupportTest {

  @Test
  void providerId_usesTenantNamespace() {
    assertThat(TenantSsoOidcSupport.providerId("acme")).isEqualTo("tenant:acme");
    assertThat(TenantSsoOidcSupport.isTenantProvider("tenant:acme")).isTrue();
    assertThat(TenantSsoOidcSupport.tenantSlugFromProviderId("tenant:acme")).isEqualTo("acme");
  }

  @Test
  void resolveScopes_defaultsWhenBlank() {
    assertThat(TenantSsoOidcSupport.resolveScopes(null)).contains("openid", "email");
    assertThat(TenantSsoOidcSupport.resolveScopes("openid profile")).containsExactly("openid", "profile");
  }
}
