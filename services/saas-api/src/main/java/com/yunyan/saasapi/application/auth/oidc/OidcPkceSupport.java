package com.yunyan.saasapi.application.auth.oidc;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import org.springframework.stereotype.Component;

@Component
public class OidcPkceSupport {

  private static final SecureRandom RANDOM = new SecureRandom();

  public String generateCodeVerifier() {
    var bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  public String codeChallengeS256(String codeVerifier) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      var hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to compute PKCE challenge", ex);
    }
  }

  public String randomState() {
    return randomToken();
  }

  public String randomNonce() {
    return randomToken();
  }

  private static String randomToken() {
    var bytes = new byte[24];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}
