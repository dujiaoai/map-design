package com.yunyan.saasapi.application.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TenantSamlCertificateExpiryAlertJob {

  private final TenantSamlCertificateExpiryAlertService alertService;

  @Scheduled(
      fixedDelayString = "${saas.auth.saml.cert-expiry-alert-ms:86400000}",
      initialDelayString = "${saas.auth.saml.cert-expiry-alert-ms:86400000}")
  public void checkCertificates() {
    alertService.warnExpiringCertificates();
  }
}
