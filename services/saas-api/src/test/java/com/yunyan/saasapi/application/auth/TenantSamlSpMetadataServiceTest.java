package com.yunyan.saasapi.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlSpMetadataServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("99999999-9999-9999-9999-999999999901");

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantSamlConfigRepository samlConfigRepository;

  private TenantSamlSpMetadataService service;

  @BeforeEach
  void setUp() {
    var props = new SaasAppProperties();
    props.getApp().setWebBaseUrl("http://localhost:5175");
    service = new TenantSamlSpMetadataService(tenantRepository, samlConfigRepository, props);
  }

  @Test
  void buildMetadataXml_includesEntityDescriptorAndAcs() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("acme");
    when(tenantRepository.findBySlug("acme")).thenReturn(Optional.of(tenant));
    var config = new TenantSamlConfig();
    config.setTenantId(TENANT_ID);
    config.setEnabled(true);
    config.setSpEntityId("https://sp.example/acme");
    config.setAcsUrl("https://sp.example/acs");
    config.setSpCertificatePem(
        "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----");
    when(samlConfigRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(config));

    var xml = service.buildMetadataXml("acme");

    assertThat(xml).contains("EntityDescriptor");
    assertThat(xml).contains("https://sp.example/acme");
    assertThat(xml).contains("https://sp.example/acs");
    assertThat(xml).contains("MIIB");
  }

  @Test
  void buildMetadataXml_whenDisabled_throws() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    tenant.setSlug("acme");
    when(tenantRepository.findBySlug("acme")).thenReturn(Optional.of(tenant));
    var config = new TenantSamlConfig();
    config.setEnabled(false);
    when(samlConfigRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(config));

    assertThatThrownBy(() -> service.buildMetadataXml("acme"))
        .isInstanceOf(AuthException.class);
  }
}
