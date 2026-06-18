package com.yunyan.saasapi.application.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@Slf4j
public class AuditWebhookHttpClient {

  private final RestClient restClient;

  public AuditWebhookHttpClient(RestClient.Builder restClientBuilder) {
    this.restClient = restClientBuilder.build();
  }

  public boolean postJson(String url, String jsonBody) {
    try {
      restClient
          .post()
          .uri(url)
          .contentType(MediaType.APPLICATION_JSON)
          .body(jsonBody)
          .retrieve()
          .toBodilessEntity();
      return true;
    } catch (RestClientException ex) {
      log.warn("Audit webhook POST failed: {}", ex.getMessage());
      return false;
    }
  }
}
