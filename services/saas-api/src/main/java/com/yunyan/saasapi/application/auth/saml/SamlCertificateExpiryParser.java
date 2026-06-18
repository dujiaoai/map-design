package com.yunyan.saasapi.application.auth.saml;

import java.io.ByteArrayInputStream;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class SamlCertificateExpiryParser {

  public Instant parseExpiry(String certificatePem) {
    if (certificatePem == null || certificatePem.isBlank()) {
      return null;
    }
    try {
      var factory = CertificateFactory.getInstance("X.509");
      var cert =
          (X509Certificate)
              factory.generateCertificate(new ByteArrayInputStream(certificatePem.getBytes()));
      return cert.getNotAfter().toInstant();
    } catch (Exception ex) {
      return null;
    }
  }
}
