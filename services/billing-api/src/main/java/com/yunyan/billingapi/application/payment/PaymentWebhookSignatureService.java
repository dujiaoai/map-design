package com.yunyan.billingapi.application.payment;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PaymentWebhookSignatureService {

  /** Dev/skeleton HMAC header; production WeChat uses {@link #WECHAT_SIGNATURE_HEADER}. */
  public static final String SIGNATURE_HEADER = "X-Billing-Webhook-Signature";

  public static final String WECHAT_SIGNATURE_HEADER = "Wechatpay-Signature";
  public static final String WECHAT_TIMESTAMP_HEADER = "Wechatpay-Timestamp";
  public static final String WECHAT_NONCE_HEADER = "Wechatpay-Nonce";

  public static final String ALIPAY_SIGNATURE_HEADER = "Alipay-Signature";

  private final BillingAppProperties billingAppProperties;

  public PaymentWebhookSignatureService(BillingAppProperties billingAppProperties) {
    this.billingAppProperties = billingAppProperties;
  }

  public void verifyIfEnabled(String channel, String rawBody, HttpServletRequest request) {
    if (!billingAppProperties.getWebhook().isSignatureVerifyEnabled()) {
      return;
    }
    var body = rawBody != null ? rawBody : "";
    switch (resolveMode(channel)) {
      case WECHAT_V3 -> verifyWechatV3(body, request);
      case ALIPAY_RSA -> verifyAlipayRsa(body, request);
      default -> verifyHmac(channel, body, request.getHeader(SIGNATURE_HEADER));
    }
  }

  /** Computes HMAC-SHA256 hex digest for tests and provider callback simulation. */
  public static String signHmacSha256Hex(String secret, String rawBody) {
    try {
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return HexFormat.of().formatHex(mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to sign webhook payload", exception);
    }
  }

  /** @deprecated use {@link #signHmacSha256Hex(String, String)} */
  @Deprecated
  public static String sign(String secret, String rawBody) {
    return signHmacSha256Hex(secret, rawBody);
  }

  public static String buildWechatV3Message(String timestamp, String nonce, String rawBody) {
    return timestamp + "\n" + nonce + "\n" + rawBody + "\n";
  }

  private void verifyHmac(String channel, String rawBody, String signatureHeader) {
    var secret = resolveHmacSecret(channel);
    if (!StringUtils.hasText(secret)) {
      throw AuthException.unauthorized("Webhook signature verify enabled but secret missing");
    }
    if (!StringUtils.hasText(signatureHeader)) {
      throw AuthException.unauthorized("Missing webhook signature");
    }
    var expected = signHmacSha256Hex(secret, rawBody);
    if (!constantTimeEquals(expected, signatureHeader.trim())) {
      throw AuthException.unauthorized("Invalid webhook signature");
    }
  }

  private void verifyWechatV3(String rawBody, HttpServletRequest request) {
    var publicKeyPem = billingAppProperties.getWebhook().getWechatPlatformPublicKeyPem();
    if (!StringUtils.hasText(publicKeyPem)) {
      throw AuthException.unauthorized("WeChat V3 signature verify enabled but public key missing");
    }
    var signature = request.getHeader(WECHAT_SIGNATURE_HEADER);
    var timestamp = request.getHeader(WECHAT_TIMESTAMP_HEADER);
    var nonce = request.getHeader(WECHAT_NONCE_HEADER);
    if (!StringUtils.hasText(signature)
        || !StringUtils.hasText(timestamp)
        || !StringUtils.hasText(nonce)) {
      throw AuthException.unauthorized("Missing WeChat V3 webhook signature headers");
    }
    var message = buildWechatV3Message(timestamp.trim(), nonce.trim(), rawBody);
    var publicKey = RsaSignatureSupport.loadPublicKeyFromPem(publicKeyPem);
    if (!RsaSignatureSupport.verifySha256Rsa(publicKey, message, signature)) {
      throw AuthException.unauthorized("Invalid WeChat V3 webhook signature");
    }
  }

  private void verifyAlipayRsa(String rawBody, HttpServletRequest request) {
    var publicKeyPem = billingAppProperties.getWebhook().getAlipayPublicKeyPem();
    if (!StringUtils.hasText(publicKeyPem)) {
      throw AuthException.unauthorized("Alipay RSA signature verify enabled but public key missing");
    }
    var signature = request.getHeader(ALIPAY_SIGNATURE_HEADER);
    if (!StringUtils.hasText(signature)) {
      throw AuthException.unauthorized("Missing Alipay webhook signature");
    }
    var publicKey = RsaSignatureSupport.loadPublicKeyFromPem(publicKeyPem);
    if (!RsaSignatureSupport.verifySha256Rsa(publicKey, rawBody, signature)) {
      throw AuthException.unauthorized("Invalid Alipay webhook signature");
    }
  }

  private WebhookSignatureMode resolveMode(String channel) {
    var webhook = billingAppProperties.getWebhook();
    if (PaymentWebhookChannels.WECHAT.equals(channel)) {
      return WebhookSignatureMode.fromConfig(webhook.getWechatSignatureMode());
    }
    if (PaymentWebhookChannels.ALIPAY.equals(channel)) {
      return WebhookSignatureMode.fromConfig(webhook.getAlipaySignatureMode());
    }
    return WebhookSignatureMode.HMAC;
  }

  private String resolveHmacSecret(String channel) {
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
