package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Skeleton HMAC-SHA256 webhook signature verification. Production WeChat/Alipay SDK verify
 * replaces this when provider credentials are wired.
 */
@Service
public class PaymentWebhookSignatureService {

  public static final String SIGNATURE_HEADER = "X-Billing-Webhook-Signature";

  private final BillingAppProperties billingAppProperties;

  public PaymentWebhookSignatureService(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  public void verifyIfEnabled(String channel, String rawBody, String signatureHeader) {
    if (!billingAppProperties.getWebhook().isSignatureVerifyEnabled()) {
      return;
    }
    var secret = resolveSecret(channel);
    if (!StringUtils.hasText(secret)) {
      throw AuthException.unauthorized("Webhook signature verify enabled but secret missing");
    }
    if (!StringUtils.hasText(signatureHeader)) {
      throw AuthException.unauthorized("Missing webhook signature");
    }
    var expected = sign(secret, rawBody != null ? rawBody : "");
    if (!constantTimeEquals(expected, signatureHeader.trim())) {
      throw AuthException.unauthorized("Invalid webhook signature");
    }
  }

  /** Computes HMAC-SHA256 hex digest for tests and provider callback simulation. */
  public static String sign(String secret, String rawBody) {
    try {
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return HexFormat.of().formatHex(mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to sign webhook payload", exception);
    }
  }

  private String resolveSecret(String channel) {
    var webhook = billingAppProperties.getWebhook();
    if (PaymentWebhookChannels.WECHAT.equals(channel)) {
      return webhook.getWechatSignSecret();
    }
    if (PaymentWebhookChannels.ALIPAY.equals(channel)) {
      return webhook.getAlipaySignSecret();
    }
    return null;
  }

  private static boolean constantTimeEquals(String expected, String actual) {
    if (expected.length() != actual.length()) {
      return false;
    }
    var mismatch = 0;
    for (var i = 0; i < expected.length(); i++) {
      mismatch |= expected.charAt(i) ^ actual.charAt(i);
    }
    return mismatch == 0;
  }
}
