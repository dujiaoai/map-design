package com.yunyan.billingapi;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.util.Base64;

public final class BillingWebhookRsaTestSupport {

  private BillingWebhookRsaTestSupport() {}

  public static KeyPair generateRsaKeyPair() {
    try {
      var generator = KeyPairGenerator.getInstance("RSA");
      generator.initialize(2048);
      return generator.generateKeyPair();
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to generate RSA key pair", exception);
    }
  }

  public static String toPublicKeyPem(KeyPair keyPair) {
    return wrapPem(
        "PUBLIC KEY",
        Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(keyPair.getPublic().getEncoded()));
  }

  public static String toPrivateKeyPem(KeyPair keyPair) {
    return wrapPem(
        "PRIVATE KEY",
        Base64.getMimeEncoder(64, new byte[] {'\n'}).encodeToString(keyPair.getPrivate().getEncoded()));
  }

  private static String wrapPem(String label, String base64Body) {
    return "-----BEGIN " + label + "-----\n" + base64Body + "\n-----END " + label + "-----";
  }
}
