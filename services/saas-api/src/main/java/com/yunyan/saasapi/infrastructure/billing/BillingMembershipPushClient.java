package com.yunyan.saasapi.infrastructure.billing;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yunyan.saasapi.config.BillingApiProperties;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "saas.billing.membership-sync", name = "push-enabled", havingValue = "true")
@RequiredArgsConstructor
public class BillingMembershipPushClient {

  private static final String INTERNAL_TOKEN_HEADER = "X-Billing-Internal-Token";
  private static final String CALLER_SERVICE_HEADER = "X-Billing-Caller-Service";
  private static final String PUSH_SIGNATURE_HEADER = "X-Billing-Membership-Push-Signature";
  private static final String CALLER_SERVICE = "saas-api";

  private final BillingApiProperties billingApiProperties;
  private final RestTemplateBuilder restTemplateBuilder;
  private final ObjectMapper objectMapper;

  public boolean pushMembershipEvent(String eventId, String eventType, String payload) {
    if (!billingApiProperties.isEnabled()) {
      return false;
    }
    var url =
        billingApiProperties.getBaseUrl().replaceAll("/$", "")
            + "/internal/v1/billing/membership/sync-events";
    var body =
        Map.of(
            "items",
            List.of(Map.of("id", eventId, "eventType", eventType, "payload", payload)));
    try {
      var rawBody = objectMapper.writeValueAsString(body);
      restTemplate()
          .postForEntity(url, jsonEntity(rawBody), Map.class);
      return true;
    } catch (JsonProcessingException ex) {
      log.warn("Failed to serialize membership push payload for event {}: {}", eventId, ex.getMessage());
      return false;
    } catch (RestClientException ex) {
      log.debug("Membership CDC push failed for event {}: {}", eventId, ex.getMessage());
      return false;
    }
  }

  private RestTemplate restTemplate() {
    return restTemplateBuilder.build();
  }

  private HttpEntity<String> jsonEntity(String rawBody) {
    var headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set(INTERNAL_TOKEN_HEADER, billingApiProperties.getInternalToken());
    headers.set(CALLER_SERVICE_HEADER, CALLER_SERVICE);
    if (billingApiProperties.getMembershipSync().isPushSignatureEnabled()) {
      var secret = billingApiProperties.getMembershipSync().getPushSignatureHmacSecret();
      if (StringUtils.hasText(secret)) {
        headers.set(PUSH_SIGNATURE_HEADER, signHmacSha256Hex(secret, rawBody));
      }
    }
    return new HttpEntity<>(rawBody, headers);
  }

  static String signHmacSha256Hex(String secret, String rawBody) {
    try {
      var mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return HexFormat.of().formatHex(mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception exception) {
      throw new IllegalStateException("Failed to sign membership push payload", exception);
    }
  }
}
