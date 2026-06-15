package com.yunyan.billingapi.application.payment;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

/** RSA-SHA256 helpers for provider webhook signature verification and tests. */
public final class RsaSignatureSupport {

  private RsaSignatureSupport() {}

  public static PublicKey loadPublicKeyFromPem(String pem) {
    try {
      var normalized =
          pem.replace("-----BEGIN PUBLIC KEY-----", "")
              .replace("-----END PUBLIC KEY-----", "")
              .replaceAll("\\s", "");
      var keyBytes = Base64.getDecoder().decode(normalized);
      return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(keyBytes));
    } catch (Exception exception) {
      throw new IllegalArgumentException("Invalid RSA public key PEM", exception);
    }
  }

  public static PrivateKey loadPrivateKeyFromPem(String pem) {
    try {
      var normalized =
          pem.replace("-----BEGIN PRIVATE KEY-----", "")
              .replace("-----END PRIVATE KEY-----", "")
              .replaceAll("\\s", "");
      var keyBytes = Base64.getDecoder().decode(normalized);
      return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(keyBytes));
    } catch (Exception exception) {
      throw new IllegalArgumentException("Invalid RSA private key PEM", exception);
    }
  }

  public static boolean verifySha256Rsa(PublicKey publicKey, String message, String signatureBase64) {
    try {
      var signature = Signature.getInstance("SHA256withRSA");
      signature.initVerify(publicKey);
      signature.update(message.getBytes(StandardCharsets.UTF_8));
      return signature.verify(Base64.getDecoder().decode(signatureBase64.trim()));
    } catch (Exception exception) {
      return false;
    }
  }

  public static String signSha256Rsa(PrivateKey privateKey, String message) {
    try {
      var signature = Signature.getInstance("SHA256withRSA");
      signature.initSign(privateKey);
      signature.update(message.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(signature.sign());
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to sign RSA message", exception);
    }
  }
}
