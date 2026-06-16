package com.yunyan.saasapi.application.auth.oidc;

import com.fasterxml.jackson.databind.JsonNode;
import com.yunyan.saasapi.security.AuthException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class OidcUserInfoClient {

  private final RestClient restClient = RestClient.create();

  public String fetchVerifiedEmail(String userinfoEndpoint, String accessToken) {
    if (!StringUtils.hasText(userinfoEndpoint)) {
      throw AuthException.badRequest("OIDC userinfo endpoint unavailable");
    }
    var body =
        restClient
            .get()
            .uri(userinfoEndpoint)
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .body(JsonNode.class);
    if (body == null || !body.hasNonNull("email")) {
      throw AuthException.unauthorized("OIDC userinfo missing email");
    }
    var email = body.get("email").asText();
    if (!StringUtils.hasText(email)) {
      throw AuthException.unauthorized("OIDC userinfo missing email");
    }
    if (body.has("email_verified") && !body.get("email_verified").asBoolean(true)) {
      throw AuthException.forbidden("OIDC email not verified");
    }
    return email.trim();
  }
}
