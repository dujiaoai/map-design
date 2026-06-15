package com.yunyan.billingapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "billing")
public class BillingAppProperties {

  private final SignupBonus signupBonus = new SignupBonus();
  private final Internal internal = new Internal();
  private final Payment payment = new Payment();
  private final Recharge recharge = new Recharge();
  private final Hold hold = new Hold();
  private final Refund refund = new Refund();
  private final Webhook webhook = new Webhook();
  private final RateLimit rateLimit = new RateLimit();

  @Data
  public static class RateLimit {
    private boolean enabled = true;
    private WebhookRateLimit webhook = new WebhookRateLimit();
    private AdminRateLimit admin = new AdminRateLimit();
  }

  @Data
  public static class WebhookRateLimit {
    private int ipMaxAttempts = 120;
    private java.time.Duration ipWindow = java.time.Duration.ofMinutes(1);
  }

  @Data
  public static class AdminRateLimit {
    private int adjustMaxAttempts = 30;
    private java.time.Duration adjustWindow = java.time.Duration.ofHours(1);
    private int refundMaxAttempts = 10;
    private java.time.Duration refundWindow = java.time.Duration.ofHours(1);
  }

  @Data
  public static class Webhook {
    /** Shared token for payment provider callbacks (skeleton; replace with signature verify). */
    private String token = "dev-billing-webhook-token-change-me";
  }

  @Data
  public static class Recharge {
    /** Pending order TTL before auto-expire (minutes). */
    private int orderTtlMinutes = 30;
    /** Scan interval for pending order expiry job (ms). */
    private long expireScanMs = 300_000L;
  }

  @Data
  public static class Refund {
    /** Scan interval for stuck refunding recovery job (ms). */
    private long recoveryScanMs = 300_000L;
    /** Treat refunding orders older than this as stuck (minutes). */
    private int stuckMinutes = 30;
  }

  @Data
  public static class Hold {
    private int ttlMinutes = 30;
    /** Max quantity per hold request (abuse guard). */
    private long maxQuantity = 10_000L;
    /** Max computed points debited per hold (aligns with adjust cap). */
    private long maxPointsPerHold = 1_000_000L;
    /** Max idempotency key length after trim. */
    private int idempotencyKeyMaxLength = 128;
    /** Max bizRef length. */
    private int bizRefMaxLength = 256;
  }

  @Data
  public static class Payment {
    /** Enables POST .../mock-pay for sandbox recharge completion. */
    private boolean mockEnabled = false;
  }

  @Data
  public static class SignupBonus {
    private long personal = 500L;
    private long organization = 1000L;
  }

  @Data
  public static class Internal {
    /** Shared secret for saas-api → billing-api internal calls */
    private String token = "dev-billing-internal-token-change-me";
    /** Allowed {@link com.yunyan.billingapi.security.InternalAuthFilter#CALLER_SERVICE_HEADER} values; empty disables check. */
    private java.util.List<String> allowedCallers = java.util.List.of();
  }
}
