package com.yunyan.saasapi.application.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.auth.saml.SelfSignedSpCertificateGenerator;
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
class TenantSamlSpCertificateRotationJobTest {

  @Mock private TenantSamlConfigRepository samlConfigRepository;

  @InjectMocks private TenantSamlSpCertificateRotationJob job;

  @Test
  void rotateExpiringCertificates_updatesNearExpiry() {
    var config = new TenantSamlConfig();
    config.setTenantId(UUID.randomUUID());
    config.setEnabled(true);
    config.setSpCertificateExpiresAt(Instant.now().plusSeconds(3600));
    when(samlConfigRepository.listAll()).thenReturn(List.of(config));
    job.rotateExpiringCertificates();
    verify(samlConfigRepository).update(any(TenantSamlConfig.class));
  }
}
