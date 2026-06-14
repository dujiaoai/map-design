package com.yunyan.saasapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "saas.billing")
public class BillingApiProperties {

  /** When false, signup-bonus and other billing calls are no-ops */
  private boolean enabled = false;

  private String baseUrl = "http://localhost:8083";
  private String internalToken = "dev-billing-internal-token-change-me";

  private final SignupBonusRetry signupBonusRetry = new SignupBonusRetry();

  @Data
  public static class SignupBonusRetry {
    /** Scan interval for pending signup bonus retry job (ms). */
    private long scanMs = 300_000L;
    /** Stop retrying after this many attempts. */
    private int maxAttempts = 20;
  }
}
