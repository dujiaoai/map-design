package com.yunyan.saasapi.application.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
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
    return postJson(url, jsonBody, null);
  }

  public boolean postJson(String url, String jsonBody, String signatureHex) {
    try {
      var request = restClient.post().uri(url).contentType(MediaType.APPLICATION_JSON);
      if (StringUtils.hasText(signatureHex)) {
        request = request.header("X-Webhook-Signature", "sha256=" + signatureHex);
      }
      request.body(jsonBody).retrieve().toBodilessEntity();
      return true;
    } catch (RestClientException ex) {
      log.warn("Audit webhook POST failed: {}", ex.getMessage());
      return false;
    }
  }

  public boolean pingTarget(String url) {
    try {
      restClient.head().uri(url).retrieve().toBodilessEntity();
      return true;
    } catch (RestClientException ex) {
      try {
        restClient
            .post()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .body("{}")
            .retrieve()
            .toBodilessEntity();
        return true;
      } catch (RestClientException postEx) {
        log.warn("Audit webhook ping failed: {}", postEx.getMessage());
        return false;
      }
    }
  }
}
