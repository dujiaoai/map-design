package com.yunyan.billingapi.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "billing")
public class BillingAppProperties {

  private final SignupBonus signupBonus = new SignupBonus();
  private final Internal internal = new Internal();

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
