package com.yunyan.saasapi.web.dto.auth;

import java.util.List;

public record OidcProvidersResponse(
    boolean enabled,
    boolean authorizationCodeFlowAvailable,
    List<OidcProviderSummary> providers) {

  public record OidcProviderSummary(String id, String displayName) {}
}
