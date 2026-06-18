package com.yunyan.saasapi.application.admin;

import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AuditWebhookHmacSigner {

  private static final String HMAC_SHA256 = "HmacSHA256";

  public String sign(String secret, String payload) {
    if (!StringUtils.hasText(secret)) {
      return "";
    }
    try {
      var mac = Mac.getInstance(HMAC_SHA256);
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
      var digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
      return toHex(digest);
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to sign audit webhook payload", ex);
    }
  }

  private static String toHex(byte[] bytes) {
    var builder = new StringBuilder(bytes.length * 2);
    for (byte value : bytes) {
      builder.append(String.format("%02x", value));
    }
    return builder.toString();
  }
}
