package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.saml.SelfSignedSpCertificateGenerator;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantSamlSpCertificateRotationJob {

  private static final Logger log = LoggerFactory.getLogger(TenantSamlSpCertificateRotationJob.class);
  private static final int VALID_DAYS = 365;
  private static final Duration ROTATION_LEAD = Duration.ofDays(30);

  private final TenantSamlConfigRepository samlConfigRepository;

  @Scheduled(
      fixedDelayString = "${saas.saml.sp-cert-rotation-ms:86400000}",
      initialDelayString = "${saas.saml.sp-cert-rotation-ms:86400000}")
  public void rotateExpiringCertificates() {
    var threshold = Instant.now().plus(ROTATION_LEAD);
    for (var config : samlConfigRepository.listAll()) {
      if (!Boolean.TRUE.equals(config.getEnabled())) {
        continue;
      }
      var expiresAt = config.getSpCertificateExpiresAt();
      if (expiresAt == null || expiresAt.isAfter(threshold)) {
        continue;
      }
      try {
        var generated = SelfSignedSpCertificateGenerator.generate("tenant-" + config.getTenantId() + "-sp", VALID_DAYS);
        config.setSpCertificatePem(generated.certificatePem());
        config.setSpCertificateExpiresAt(generated.expiresAt());
        config.setUpdatedAt(Instant.now());
        samlConfigRepository.update(config);
        log.info("Auto-rotated SP certificate for tenant {}", config.getTenantId());
      } catch (Exception ex) {
        log.warn("SP certificate auto-rotation failed for tenant {}: {}", config.getTenantId(), ex.getMessage());
      }
    }
  }
}
