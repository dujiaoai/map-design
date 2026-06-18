package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.domain.TenantOidcConfigRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.TenantSsoPublicResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSsoAuthService {

  private final TenantRepository tenantRepository;
  private final TenantOidcConfigRepository oidcConfigRepository;

  public TenantSsoPublicResponse getPublicSsoBySlug(String slug) {
    var normalized = slug == null ? "" : slug.trim();
    if (!StringUtils.hasText(normalized)) {
      throw AuthException.badRequest("Tenant slug is required");
    }
    var tenant =
        tenantRepository
            .findBySlug(normalized)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return oidcConfigRepository
        .findByTenantId(tenant.getId())
        .map(config -> toPublicResponse(tenant.getSlug(), config))
        .orElseGet(() -> disabledResponse(tenant.getSlug()));
  }

  private static TenantSsoPublicResponse toPublicResponse(
      String slug, com.yunyan.saasapi.domain.entity.TenantOidcConfig config) {
    if (!Boolean.TRUE.equals(config.getEnabled())) {
      return disabledResponse(slug);
    }
    var configured =
        StringUtils.hasText(config.getIssuerUri()) && StringUtils.hasText(config.getClientId());
    var displayName =
        StringUtils.hasText(config.getDisplayName()) ? config.getDisplayName().trim() : "企业 SSO";
    return new TenantSsoPublicResponse(slug, true, displayName, configured);
  }

  private static TenantSsoPublicResponse disabledResponse(String slug) {
    return new TenantSsoPublicResponse(slug, false, null, false);
  }
}
