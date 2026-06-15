package com.yunyan.saasapi.infrastructure.billing;

import com.yunyan.saasapi.config.BillingApiProperties;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

@Component
@ConditionalOnProperty(name = "saas.billing.enabled", havingValue = "true")
public class BillingApiHealthIndicator implements HealthIndicator {

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;

  public BillingApiHealthIndicator(
      BillingApiProperties billingApiProperties, RestTemplateBuilder restTemplateBuilder) {
    this.billingApiProperties = billingApiProperties;
    this.restTemplateBuilder = restTemplateBuilder;
  }

  @Override
  public Health health() {
    var baseUrl = billingApiProperties.getBaseUrl();
    try {
      var response =
          restTemplateBuilder
              .build()
              .getForEntity(baseUrl + "/actuator/health", String.class);
      if (response.getStatusCode().is2xxSuccessful()) {
        return Health.up().withDetail("url", baseUrl).build();
      }
      return Health.down()
          .withDetail("url", baseUrl)
          .withDetail("status", response.getStatusCode().value())
          .build();
    } catch (RestClientException ex) {
      return Health.down(ex).withDetail("url", baseUrl).build();
    }
  }
}
