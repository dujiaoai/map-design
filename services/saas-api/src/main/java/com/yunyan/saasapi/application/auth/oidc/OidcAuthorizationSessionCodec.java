package com.yunyan.saasapi.application.auth.oidc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

@Component
public class OidcAuthorizationSessionCodec {

  private final ObjectMapper objectMapper;

  public OidcAuthorizationSessionCodec(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public String encode(OidcAuthorizationSession session) {
    try {
      return objectMapper.writeValueAsString(session);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to encode OIDC session", ex);
    }
  }

  public OidcAuthorizationSession decode(String raw) {
    try {
      return objectMapper.readValue(raw, OidcAuthorizationSession.class);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to decode OIDC session", ex);
    }
  }
}
