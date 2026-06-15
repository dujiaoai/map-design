package com.yunyan.billingapi.infrastructure.saas;

import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.InternalAuthFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "source", havingValue = "api")
public class SaasMembershipApiClient {

  private final BillingAppProperties billingAppProperties;
  private final RestClient restClient;
  private final ObjectMapper objectMapper;

  public SaasMembershipApiClient(
      BillingAppProperties billingAppProperties, RestClient restClient, ObjectMapper objectMapper) {
    this.billingAppProperties = billingAppProperties;
    this.restClient = restClient;
    this.objectMapper = objectMapper;
  }

  public boolean isTenantMember(UUID tenantId, UUID userId) {
    var baseUrl = billingAppProperties.getMembershipSync().getSaasApiBaseUrl().trim();
    if (!StringUtils.hasText(baseUrl)) {
      throw AuthException.badRequest(
          "billing.membership-sync.saas-api-base-url is required when source=api");
    }
    var token = billingAppProperties.getInternal().getToken();
    if (!StringUtils.hasText(token)) {
      throw new AuthException(HttpStatus.SERVICE_UNAVAILABLE, "Internal billing token is not configured");
    }

    var uri =
        baseUrl.replaceAll("/$", "")
            + "/internal/v1/membership/tenants/"
            + tenantId
            + "/users/"
            + userId;

    try {
      var body =
          restClient
              .get()
              .uri(uri)
              .header(InternalAuthFilter.INTERNAL_TOKEN_HEADER, token)
              .header(InternalAuthFilter.CALLER_SERVICE_HEADER, "billing-api")
              .retrieve()
              .body(String.class);
      var json = objectMapper.readTree(body != null ? body : "{}");
      return json.path("member").asBoolean(false);
    } catch (RestClientException ex) {
      throw new AuthException(
          HttpStatus.BAD_GATEWAY, "saas-api membership check failed: " + ex.getMessage());
    } catch (java.io.IOException ex) {
      throw new AuthException(HttpStatus.BAD_GATEWAY, "saas-api membership response parse failed");
    }
  }
}
