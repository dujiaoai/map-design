package com.yunyan.saasapi.application.auth.oidc;

public record OidcDiscoveryDocument(
    String issuer,
    String authorizationEndpoint,
    String tokenEndpoint,
    String userinfoEndpoint) {}
