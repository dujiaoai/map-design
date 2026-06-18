package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantOidcCallbackUrlValidatorTest {

  private static final UUID TENANT_ID = UUID.fromString("11111111-1111-1111-1111-111111111101");

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private TenantRepository tenantRepository;

  @InjectMocks private TenantOidcCallbackUrlValidator validator;

  @BeforeEach
  void setUp() {
    var app = new SaasAppProperties.App();
    app.setWebBaseUrl("http://localhost:5175/");
    when(saasAppProperties.getApp()).thenReturn(app);
  }

  @Test
  void expectedCallbackUrl_bySlug_trimsBaseSlash() {
    assertThat(validator.expectedCallbackUrl("acme-corp"))
        .isEqualTo("http://localhost:5175/auth/tenant-sso/callback/acme-corp");
  }

  @Test
  void expectedCallbackUrl_byTenantId_usesRepositorySlug() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("test");
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));

    assertThat(validator.expectedCallbackUrl(TENANT_ID))
        .isEqualTo("http://localhost:5175/auth/tenant-sso/callback/test");
  }
}
