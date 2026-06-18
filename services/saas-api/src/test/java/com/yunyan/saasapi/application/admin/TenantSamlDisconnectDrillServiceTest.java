package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.saml.SamlAuthnRequestBuilder;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.TenantSamlDisconnectDrillLogRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.SaasPrincipal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlDisconnectDrillServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlConfigRepository samlConfigRepository;
  @Mock private TenantSamlIdpFederationRepository federationRepository;
  @Mock private TenantSamlDisconnectDrillLogRepository drillLogRepository;
  @Mock private SamlAuthnRequestBuilder authnRequestBuilder;
  @Mock private AuditWebhookHttpClient httpClient;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private TenantSamlDisconnectDrillService service;

  @Test
  void runDrill_recordsSuccessWhenAuthnRequestBuilt() {
    var tenantId = UUID.randomUUID();
    var principal =
        new SaasPrincipal(
            UUID.randomUUID(), UUID.randomUUID(), null, "admin@test.local", List.of(), List.of(), null, null);
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new SysTenant()));
    var config = new TenantSamlConfig();
    config.setTenantId(tenantId);
    config.setEnabled(true);
    config.setEntityId("idp-entity");
    config.setSsoUrl("https://idp.example/sso");
    config.setAcsUrl("https://app.example/auth/saml/acs");
    config.setSpEntityId("sp-entity");
    when(samlConfigRepository.findByTenantId(tenantId)).thenReturn(Optional.of(config));
    when(authnRequestBuilder.buildRedirectUrl(any(), any(), any(), any()))
        .thenReturn("https://idp.example/sso?SAMLRequest=abc");
    when(httpClient.pingTarget(eq("https://idp.example/sso"))).thenReturn(true);

    var response = service.runDrill(principal, tenantId, null);

    assertThat(response.result()).isEqualTo("success");
    verify(drillLogRepository).insert(any());
  }
}
