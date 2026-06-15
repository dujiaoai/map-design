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

  private final Client client = new Client();

  private final SignupBonusRetry signupBonusRetry = new SignupBonusRetry();

  @Data
  public static class Client {
    /** Max attempts for transient billing-api HTTP failures. */
    private int maxAttempts = 3;
    /** Base backoff between retries (ms); multiplied by attempt number. */
    private long backoffMs = 200L;
  }

  @Data
  public static class SignupBonusRetry {
    /** Scan interval for pending signup bonus retry job (ms). */
    private long scanMs = 300_000L;
    /** Stop retrying after this many attempts. */
    private int maxAttempts = 20;
  }
}
