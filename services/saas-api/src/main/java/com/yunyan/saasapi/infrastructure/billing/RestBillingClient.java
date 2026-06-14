package com.yunyan.saasapi.infrastructure.billing;

import com.yunyan.billing.BillingClient;
import com.yunyan.billing.dto.EstimateResult;
import com.yunyan.billing.dto.SignupBonusRequest;
import com.yunyan.billing.dto.WalletHoldRequest;
import com.yunyan.saasapi.config.BillingApiProperties;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestBillingClient implements BillingClient {

  private static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;

  @Override
  public Optional<String> hold(WalletHoldRequest request) {
    throw new UnsupportedOperationException("hold not implemented yet");
  }

  @Override
  public void confirm(String holdId) {
    throw new UnsupportedOperationException("confirm not implemented yet");
  }

  @Override
  public void cancel(String holdId) {
    throw new UnsupportedOperationException("cancel not implemented yet");
  }

  @Override
  public EstimateResult estimate(WalletHoldRequest request) {
    throw new UnsupportedOperationException("estimate not implemented yet");
  }

  @Override
  public void grantSignupBonus(SignupBonusRequest request) {
    if (!billingApiProperties.isEnabled()) {
      return;
    }

    var restTemplate = restTemplateBuilder.build();
    var headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set(INTERNAL_TOKEN_HEADER, billingApiProperties.getInternalToken());

    var url =
        billingApiProperties.getBaseUrl().replaceAll("/$", "")
            + "/internal/v1/billing/signup-bonus";

    try {
      restTemplate.postForEntity(url, new HttpEntity<>(request, headers), Void.class);
    } catch (RestClientException ex) {
      log.warn(
          "Failed to grant signup bonus for tenant={} user={}: {}",
          request.tenantId(),
          request.userId(),
          ex.getMessage());
    }
  }
}
