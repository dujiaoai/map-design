package com.yunyan.billingapi.infrastructure.saas;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.billingapi.config.BillingAppProperties;
import com.yunyan.billingapi.security.AuthException;
import com.yunyan.billingapi.security.InternalAuthFilter;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@ConditionalOnProperty(prefix = "billing.membership-sync", name = "source", havingValue = "cdc")
public class SaasMembershipSyncEventClient {

  public record MembershipSyncEvent(String id, String eventType, String payload) {}

  private final BillingAppProperties billingAppProperties;
  private final RestClient restClient;
  private final ObjectMapper objectMapper;

  public SaasMembershipSyncEventClient(
      BillingAppProperties billingAppProperties, RestClient restClient, ObjectMapper objectMapper) {
    this.billingAppProperties = billingAppProperties;
    this.restClient = restClient;
    this.objectMapper = objectMapper;
  }

  public List<MembershipSyncEvent> fetchPending(int limit) {
    var uri = baseUrl() + "/internal/v1/membership/sync-events?limit=" + Math.clamp(limit, 1, 500);
    try {
      var body =
          restClient
              .get()
              .uri(uri)
              .headers(this::applyInternalHeaders)
              .retrieve()
              .body(String.class);
      var json = objectMapper.readTree(body != null ? body : "{}");
      var items = json.path("items");
      if (!items.isArray()) {
        return List.of();
      }
      var events = new ArrayList<MembershipSyncEvent>();
      for (JsonNode item : items) {
        events.add(
            new MembershipSyncEvent(
                item.path("id").asText(""),
                item.path("eventType").asText(""),
                item.path("payload").asText("{}")));
      }
      return events;
    } catch (RestClientException ex) {
      throw new AuthException(
          HttpStatus.BAD_GATEWAY, "saas-api membership sync pull failed: " + ex.getMessage());
    } catch (java.io.IOException ex) {
      throw new AuthException(HttpStatus.BAD_GATEWAY, "saas-api membership sync response parse failed");
    }
  }

  public void acknowledge(List<String> eventIds) {
    if (eventIds.isEmpty()) {
      return;
    }
    var uri = baseUrl() + "/internal/v1/membership/sync-events/ack";
    try {
      restClient
          .post()
          .uri(uri)
          .headers(this::applyInternalHeaders)
          .body(java.util.Map.of("eventIds", eventIds))
          .retrieve()
          .toBodilessEntity();
    } catch (RestClientException ex) {
      throw new AuthException(
          HttpStatus.BAD_GATEWAY, "saas-api membership sync ack failed: " + ex.getMessage());
    }
  }

  private void applyInternalHeaders(org.springframework.http.HttpHeaders headers) {
    headers.set(InternalAuthFilter.INTERNAL_TOKEN_HEADER, billingAppProperties.getInternal().getToken());
    headers.set(InternalAuthFilter.CALLER_SERVICE_HEADER, "billing-api");
  }

  private String baseUrl() {
    var baseUrl = billingAppProperties.getMembershipSync().getSaasApiBaseUrl().trim();
    if (!StringUtils.hasText(baseUrl)) {
      throw AuthException.badRequest(
          "billing.membership-sync.saas-api-base-url is required when source=cdc");
    }
    return baseUrl.replaceAll("/$", "");
  }
}
