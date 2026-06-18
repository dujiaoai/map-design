package com.yunyan.saasapi.application.auth.saml;

public final class TenantSsoSamlSupport {

  private static final String PROVIDER_PREFIX = "tenant-saml:";

  private TenantSsoSamlSupport() {}

  public static String providerId(String tenantSlug) {
    return PROVIDER_PREFIX + tenantSlug.trim();
  }
}
