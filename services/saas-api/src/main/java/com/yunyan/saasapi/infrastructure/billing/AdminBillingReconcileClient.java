package com.yunyan.saasapi.infrastructure.billing;

import com.yunyan.saasapi.config.BillingApiProperties;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBillingReconcileClient {

  private static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";
  private static final String CALLER_SERVICE_HEADER = "X-Billing-Caller-Service";
  private static final String CALLER_SERVICE = "saas-api";

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;

  public long countReconcileDiffs(Instant from, Instant to) {
    if (!billingApiProperties.isEnabled() || !billingApiProperties.getUsage().isEnabled()) {
      return 0L;
    }
    var url =
        billingApiProperties.getBaseUrl().replaceAll("/$", "")
            + "/internal/v1/billing/reconciliation/diff-count?from="
            + from.toString()
            + "&to="
            + to.toString();
    try {
      var headers = new HttpHeaders();
      headers.set(INTERNAL_TOKEN_HEADER, billingApiProperties.getInternalToken());
      headers.set(CALLER_SERVICE_HEADER, CALLER_SERVICE);
      var response =
          restTemplate()
              .exchange(url, HttpMethod.GET, new HttpEntity<>(headers), DiffCountResponse.class);
      if (response.getBody() == null) {
        return 0L;
      }
      return Math.max(response.getBody().diffCount(), 0L);
    } catch (RestClientException ex) {
      log.debug("Billing reconcile diff fetch failed: {}", ex.getMessage());
      return 0L;
    }
  }

  private RestTemplate restTemplate() {
    return restTemplateBuilder.build();
  }

  record DiffCountResponse(long diffCount) {}
}
