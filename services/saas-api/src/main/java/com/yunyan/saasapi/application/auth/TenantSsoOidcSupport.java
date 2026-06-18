package com.yunyan.saasapi.application.auth;

import java.util.Arrays;
import java.util.List;
import org.springframework.util.StringUtils;

public final class TenantSsoOidcSupport {

  private static final String PROVIDER_PREFIX = "tenant:";
  private static final List<String> DEFAULT_SCOPES = List.of("openid", "profile", "email");

  private TenantSsoOidcSupport() {}

  public static String providerId(String tenantSlug) {
    return PROVIDER_PREFIX + tenantSlug.trim();
  }

  public static boolean isTenantProvider(String providerId) {
    return StringUtils.hasText(providerId) && providerId.startsWith(PROVIDER_PREFIX);
  }

  public static String tenantSlugFromProviderId(String providerId) {
    if (!isTenantProvider(providerId)) {
      return null;
    }
    return providerId.substring(PROVIDER_PREFIX.length());
  }

  public static List<String> resolveScopes(String scopes) {
    if (!StringUtils.hasText(scopes)) {
      return DEFAULT_SCOPES;
    }
    return Arrays.stream(scopes.trim().split("\\s+"))
        .filter(StringUtils::hasText)
        .map(String::trim)
        .toList();
  }
}
