package com.yunyan.saasapi.application.auth.oidc;

public record OidcAuthorizationSession(
    String state,
    String codeVerifier,
    String providerId,
    OidcClientKind clientKind,
    String tenantSlug,
    String redirectUri,
    String nonce) {}
