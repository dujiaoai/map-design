package com.yunyan.saasapi.application.auth.oidc;

import com.fasterxml.jackson.databind.JsonNode;
import com.yunyan.saasapi.security.AuthException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OidcDiscoveryClient {

  private static final Duration CACHE_TTL = Duration.ofHours(1);

  private final RestClient restClient = RestClient.create();
  private final Map<String, CachedDocument> cache = new ConcurrentHashMap<>();

  public OidcDiscoveryDocument discover(String issuerUri) {
    var cacheKey = normalizeIssuer(issuerUri);
    var cached = cache.get(cacheKey);
    if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
      return cached.document();
    }
    var discoveryUrl = cacheKey + ".well-known/openid-configuration";
    var body =
        restClient
            .get()
            .uri(discoveryUrl)
            .retrieve()
            .body(JsonNode.class);
    if (body == null
        || !body.hasNonNull("authorization_endpoint")
        || !body.hasNonNull("token_endpoint")) {
      throw AuthException.badRequest("Invalid OIDC discovery document");
    }
    var document =
        new OidcDiscoveryDocument(
            text(body, "issuer"),
            text(body, "authorization_endpoint"),
            text(body, "token_endpoint"),
            text(body, "userinfo_endpoint"));
    cache.put(cacheKey, new CachedDocument(document, Instant.now().plus(CACHE_TTL)));
    return document;
  }

  private static String text(JsonNode body, String field) {
    var node = body.get(field);
    return node == null || node.isNull() ? null : node.asText();
  }

  private static String normalizeIssuer(String issuerUri) {
    var trimmed = issuerUri.trim();
    return trimmed.endsWith("/") ? trimmed : trimmed + "/";
  }

  private record CachedDocument(OidcDiscoveryDocument document, Instant expiresAt) {}
}
