package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.TenantSamlDisconnectDrillLogRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.Tenant;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlIdpHealthServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlConfigRepository samlConfigRepository;
  @Mock private TenantSamlIdpFederationRepository federationRepository;
  @Mock private AuditWebhookHttpClient httpClient;

  @InjectMocks private TenantSamlIdpHealthService service;

  @Test
  void assess_marksPrimaryHealthyWhenSsoReachableAndMetadataFresh() {
    var tenantId = UUID.randomUUID();
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(new Tenant()));
    var config = new TenantSamlConfig();
    config.setTenantId(tenantId);
    config.setEnabled(true);
    config.setEntityId("https://idp.example/metadata");
    config.setSsoUrl("https://idp.example/sso");
    config.setLastMetadataSyncAt(Instant.now());
    when(samlConfigRepository.findByTenantId(tenantId)).thenReturn(Optional.of(config));
    when(federationRepository.listByTenantId(tenantId)).thenReturn(List.of());
    when(httpClient.pingTarget(anyString())).thenReturn(true);

    var response = service.assess(tenantId);

    assertThat(response.items()).hasSize(1);
    assertThat(response.items().get(0).healthy()).isTrue();
  }
}
