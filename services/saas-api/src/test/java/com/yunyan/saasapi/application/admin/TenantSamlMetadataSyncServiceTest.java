package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.saml.SamlIdpMetadataClient;
import com.yunyan.saasapi.application.auth.saml.SamlIdpMetadataDocument;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlMetadataSyncServiceTest {

  @Mock private TenantSamlConfigRepository samlConfigRepository;
  @Mock private SamlIdpMetadataClient metadataClient;

  @InjectMocks private TenantSamlMetadataSyncService service;

  @Test
  void syncAllEnabled_updatesConfig() {
    var config = new TenantSamlConfig();
    config.setTenantId(UUID.randomUUID());
    config.setMetadataSyncEnabled(true);
    config.setMetadataUrl("https://idp.example/metadata.xml");
    when(samlConfigRepository.listMetadataSyncEnabled()).thenReturn(List.of(config));
    when(metadataClient.fetchAndParse(any()))
        .thenReturn(
            new SamlIdpMetadataDocument(
                "entity", "https://sso", "pem", Instant.parse("2027-01-01T00:00:00Z")));

    service.syncAllEnabled();

    assertThat(config.getEntityId()).isEqualTo("entity");
    assertThat(config.getIdpCertExpiresAt()).isNotNull();
    verify(samlConfigRepository).update(config);
  }
}
