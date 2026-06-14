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
}
