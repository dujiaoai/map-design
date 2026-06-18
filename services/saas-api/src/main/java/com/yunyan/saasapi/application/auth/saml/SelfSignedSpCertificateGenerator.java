package com.yunyan.saasapi.application.auth.saml;

import java.nio.charset.StandardCharsets;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

public final class SelfSignedSpCertificateGenerator {

  private SelfSignedSpCertificateGenerator() {}

  public static GeneratedSpCertificate generate(String commonName, int validDays) {
    try {
      var keyGen = KeyPairGenerator.getInstance("RSA");
      keyGen.initialize(2048, new SecureRandom());
      var keyPair = keyGen.generateKeyPair();
      var expiresAt = Instant.now().plus(validDays, ChronoUnit.DAYS);
      var tbs =
          (commonName + "|" + expiresAt.toString()).getBytes(StandardCharsets.UTF_8);
      var signature = Base64.getEncoder().encodeToString(tbs);
      var body = Base64.getEncoder().encodeToString(keyPair.getPublic().getEncoded());
      var pem =
          "-----BEGIN CERTIFICATE-----\n"
              + chunk(body + signature, 64)
              + "\n-----END CERTIFICATE-----";
      return new GeneratedSpCertificate(pem, expiresAt);
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to generate SP certificate", ex);
    }
  }

  private static String chunk(String value, int width) {
    var sb = new StringBuilder();
    for (var i = 0; i < value.length(); i += width) {
      if (i > 0) {
        sb.append('\n');
      }
      sb.append(value, i, Math.min(i + width, value.length()));
    }
    return sb.toString();
  }

  public record GeneratedSpCertificate(String certificatePem, Instant expiresAt) {}
}
