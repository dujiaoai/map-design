package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantSamlCertificateExpiryAlertServiceTest {

  @Mock private TenantSamlConfigRepository samlConfigRepository;
  @Mock private SaasAppProperties saasAppProperties;
  @Mock private AuditWebhookHttpClient auditWebhookHttpClient;

  @InjectMocks private TenantSamlCertificateExpiryAlertService service;

  @Test
  void findExpiringCertificates_detectsWithin30Days() {
    var config = new TenantSamlConfig();
    config.setTenantId(UUID.randomUUID());
    config.setIdpCertExpiresAt(Instant.now().plus(10, ChronoUnit.DAYS));
    when(samlConfigRepository.listAll()).thenReturn(List.of(config));

    var alerts = service.findExpiringCertificates();

    assertThat(alerts).hasSize(1);
    assertThat(alerts.get(0).certType()).isEqualTo("idp");
  }
}
