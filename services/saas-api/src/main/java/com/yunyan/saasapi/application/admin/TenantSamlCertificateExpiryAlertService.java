package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlCertificateExpiryAlertService {

  private static final Logger log = LoggerFactory.getLogger(TenantSamlCertificateExpiryAlertService.class);
  private static final int WARN_DAYS = 30;

  private final TenantSamlConfigRepository samlConfigRepository;
  private final SaasAppProperties saasAppProperties;
  private final AuditWebhookHttpClient auditWebhookHttpClient;

  public List<TenantSamlCertExpiryAlert> findExpiringCertificates() {
    var threshold = Instant.now().plus(WARN_DAYS, ChronoUnit.DAYS);
    var now = Instant.now();
    List<TenantSamlCertExpiryAlert> alerts = new ArrayList<>();
    for (var config : samlConfigRepository.listAll()) {
      checkExpiry(config, "idp", config.getIdpCertExpiresAt(), threshold, now, alerts);
      checkExpiry(config, "sp", config.getSpCertificateExpiresAt(), threshold, now, alerts);
    }
    return alerts;
  }

  public void warnExpiringCertificates() {
    var alerts = findExpiringCertificates();
    if (alerts.isEmpty()) {
      return;
    }
    for (var alert : alerts) {
      log.warn(
          "SAML {} certificate expiring for tenant {} at {}",
          alert.certType(),
          alert.tenantId(),
          alert.expiresAt());
    }
    var alertUrl = saasAppProperties.getAudit().getAlertWebhookUrl();
    if (!StringUtils.hasText(alertUrl)) {
      return;
    }
    var payload =
        alerts.stream()
            .map(
                a ->
                    "{\"tenantId\":\""
                        + a.tenantId()
                        + "\",\"certType\":\""
                        + a.certType()
                        + "\",\"expiresAt\":"
                        + a.expiresAt().toEpochMilli()
                        + "}")
            .reduce((a, b) -> a + "\n" + b)
            .orElse("");
    auditWebhookHttpClient.postJson(alertUrl, payload, null);
  }

  private static void checkExpiry(
      TenantSamlConfig config,
      String certType,
      Instant expiresAt,
      Instant threshold,
      Instant now,
      List<TenantSamlCertExpiryAlert> alerts) {
    if (expiresAt == null || expiresAt.isBefore(now)) {
      return;
    }
    if (!expiresAt.isAfter(threshold)) {
      alerts.add(new TenantSamlCertExpiryAlert(config.getTenantId().toString(), certType, expiresAt));
    }
  }
}
