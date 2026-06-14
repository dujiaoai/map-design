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
  private final Webhook webhook = new Webhook();

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
  public static class Hold {
    private int ttlMinutes = 30;
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
  }
}
