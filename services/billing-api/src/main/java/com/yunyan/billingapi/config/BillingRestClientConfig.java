package com.yunyan.billingapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class BillingRestClientConfig {

  @Bean
  RestClient billingRestClient(RestClient.Builder builder) {
    return builder.build();
  }
}
