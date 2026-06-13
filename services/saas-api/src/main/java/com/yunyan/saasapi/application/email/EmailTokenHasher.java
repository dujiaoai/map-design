package com.yunyan.saasapi.application.email;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class EmailTokenHasher {

  private final SaasAppProperties saasAppProperties;

  public EmailTokenHasher(SaasAppProperties saasAppProperties) {
    this.saasAppProperties = saasAppProperties;
  }

  public String generateRawToken() {
    return UUID.randomUUID() + "." + UUID.randomUUID();
  }

  public String hash(String rawToken) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      var pepper = saasAppProperties.getInvite().getTokenPepper();
      digest.update((rawToken + pepper).getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(digest.digest());
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 not available", e);
    }
  }
}
