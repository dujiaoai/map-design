package com.yunyan.saasapi.infrastructure.billing;

import com.yunyan.saasapi.config.BillingApiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "saas.billing.membership-sync", name = "push-enabled", havingValue = "true")
@RequiredArgsConstructor
public class BillingMembershipPushClient {

  private static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";
  private static final String CALLER_SERVICE_HEADER = "X-Billing-Caller-Service";
  private static final String CALLER_SERVICE = "saas-api";

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;

  public boolean pushMembershipEvent(String eventId, String eventType, String payload) {
    if (!billingApiProperties.isEnabled()) {
      return false;
    }
    var url =
        billingApiProperties.getBaseUrl().replaceAll("/$", "")
            + "/internal/v1/billing/membership/sync-events";
    var body =
        java.util.Map.of(
            "items",
            java.util.List.of(
                java.util.Map.of("id", eventId, "eventType", eventType, "payload", payload)));
    try {
      restTemplate()
          .postForEntity(url, jsonEntity(body), java.util.Map.class);
      return true;
    } catch (RestClientException ex) {
      log.debug("Membership CDC push failed for event {}: {}", eventId, ex.getMessage());
      return false;
    }
  }

  private RestTemplate restTemplate() {
    return restTemplateBuilder.build();
  }

  private <T> HttpEntity<T> jsonEntity(T body) {
    var headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set(INTERNAL_TOKEN_HEADER, billingApiProperties.getInternalToken());
    headers.set(CALLER_SERVICE_HEADER, CALLER_SERVICE);
    return new HttpEntity<>(body, headers);
  }
}
