package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class TenantOidcCallbackUrlValidator {

  private final SaasAppProperties saasAppProperties;
  private final TenantRepository tenantRepository;

  public String expectedCallbackUrl(UUID tenantId) {
    var slug =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"))
            .getSlug();
    return expectedCallbackUrl(slug);
  }

  public String expectedCallbackUrl(String tenantSlug) {
    var base = trimTrailingSlash(saasAppProperties.getApp().getWebBaseUrl());
    if (!StringUtils.hasText(base)) {
      throw AuthException.badRequest("Web base URL is not configured");
    }
    return base + "/auth/tenant-sso/callback/" + tenantSlug.trim();
  }

  public void assertCallbackRegistered(String tenantSlug) {
    expectedCallbackUrl(tenantSlug);
  }

  private static String trimTrailingSlash(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }
}
