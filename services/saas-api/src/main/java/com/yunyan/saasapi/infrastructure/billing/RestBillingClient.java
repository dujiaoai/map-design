package com.yunyan.saasapi.infrastructure.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.HoldResponse;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.saasapi.config.BillingApiProperties;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestBillingClient implements BillingClient {

  private static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;
  private final ObjectMapper objectMapper;

  @Override
  public Optional<String> hold(WalletHoldRequest request) {
    if (!billingApiProperties.isEnabled()) {
      throw new IllegalStateException("Billing is disabled (saas.billing.enabled=false)");
    }

    try {
      var response =
          restTemplate()
              .postForEntity(internalUrl("/internal/v1/billing/hold"), jsonEntity(request), HoldResponse.class);
      var body = response.getBody();
      return body == null ? Optional.empty() : Optional.ofNullable(body.holdId());
    } catch (HttpStatusCodeException ex) {
      if (ex.getStatusCode().value() == 402) {
        return Optional.empty();
      }
      throw ex;
    }
  }

  @Override
  public void confirm(String holdId) {
    if (!billingApiProperties.isEnabled()) {
      return;
    }
    restTemplate()
        .postForEntity(
            internalUrl("/internal/v1/billing/hold/" + holdId + "/confirm"),
            jsonEntity(null),
            Void.class);
  }

  @Override
  public void cancel(String holdId) {
    if (!billingApiProperties.isEnabled()) {
      return;
    }
    restTemplate()
        .postForEntity(
            internalUrl("/internal/v1/billing/hold/" + holdId + "/cancel"),
            jsonEntity(null),
            Void.class);
  }

  @Override
  public EstimateResult estimate(WalletHoldRequest request) {
    if (!billingApiProperties.isEnabled()) {
      throw new IllegalStateException("Billing is disabled (saas.billing.enabled=false)");
    }

    var url =
        internalUrl("/internal/v1/billing/estimate")
            + "?tenantId="
            + request.tenantId()
            + "&userId="
            + request.userId()
            + "&productCode="
            + request.productCode()
            + "&ruleCode="
            + request.ruleCode()
            + "&quantity="
            + request.quantity();

    var response =
        restTemplate()
            .exchange(url, HttpMethod.GET, new HttpEntity<>(internalHeaders()), EstimateResult.class);
    var body = response.getBody();
    if (body == null) {
      throw new IllegalStateException("Empty estimate response from billing-api");
    }
    return body;
  }

  @Override
  public boolean grantSignupBonus(SignupBonusRequest request) {
    if (!billingApiProperties.isEnabled()) {
      return true;
    }

    try {
      restTemplate()
          .postForEntity(
              internalUrl("/internal/v1/billing/signup-bonus"), jsonEntity(request), Void.class);
      return true;
    } catch (RestClientException ex) {
      log.warn(
          "Failed to grant signup bonus for tenant={} user={}: {}",
          request.tenantId(),
          request.userId(),
          ex.getMessage());
      return false;
    }
  }

  public Optional<BillingHoldProblem> parseHoldProblem(HttpStatusCodeException ex) {
    if (ex.getStatusCode().value() != 402) {
      return Optional.empty();
    }
    try {
      JsonNode root = objectMapper.readTree(ex.getResponseBodyAsString());
      var available = root.path("availableBalance").asLong(0L);
      var required = root.path("requiredPoints").asLong(0L);
      return Optional.of(new BillingHoldProblem(available, required));
    } catch (Exception parseError) {
      return Optional.of(new BillingHoldProblem(0L, 0L));
    }
  }

  public record BillingHoldProblem(long availableBalance, long requiredPoints) {}

  private RestTemplate restTemplate() {
    return restTemplateBuilder.build();
  }

  private String internalUrl(String path) {
    return billingApiProperties.getBaseUrl().replaceAll("/$", "") + path;
  }

  private HttpHeaders internalHeaders() {
    var headers = new HttpHeaders();
    headers.set(INTERNAL_TOKEN_HEADER, billingApiProperties.getInternalToken());
    return headers;
  }

  private HttpEntity<?> jsonEntity(Object body) {
    var headers = internalHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    return new HttpEntity<>(body, headers);
  }
}
