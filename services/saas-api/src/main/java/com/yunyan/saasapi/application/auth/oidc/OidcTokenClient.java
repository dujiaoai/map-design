package com.yunyan.saasapi.application.auth.oidc;

import com.fasterxml.jackson.databind.JsonNode;
import com.yunyan.saasapi.config.SaasAppProperties.OAuth2Provider;
import com.yunyan.saasapi.security.AuthException;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

@Component
public class OidcTokenClient {

  private final RestClient restClient = RestClient.create();

  public OidcTokenResponse exchangeAuthorizationCode(
      OAuth2Provider provider,
      OidcDiscoveryDocument discovery,
      String redirectUri,
      String code,
      String codeVerifier) {
    var form = new LinkedMultiValueMap<String, String>();
    form.add("grant_type", "authorization_code");
    form.add("code", code);
    form.add("redirect_uri", redirectUri);
    form.add("client_id", provider.getClientId());
    form.add("code_verifier", codeVerifier);
    if (provider.getClientSecret() != null && !provider.getClientSecret().isBlank()) {
      form.add("client_secret", provider.getClientSecret());
    }

    var body =
        restClient
            .post()
            .uri(discovery.tokenEndpoint())
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(JsonNode.class);
    if (body == null || !body.hasNonNull("access_token")) {
      throw AuthException.unauthorized("OIDC token exchange failed");
    }
    return new OidcTokenResponse(
        body.get("access_token").asText(),
        body.hasNonNull("id_token") ? body.get("id_token").asText() : null);
  }

  public record OidcTokenResponse(String accessToken, String idToken) {}
}
