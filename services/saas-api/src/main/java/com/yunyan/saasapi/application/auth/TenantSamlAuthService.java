package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.auth.saml.SamlAssertionValidator;
import com.yunyan.saasapi.application.auth.saml.SamlAuthnRequestBuilder;
import com.yunyan.saasapi.application.auth.saml.TenantSsoSamlSupport;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.SamlAcsRequest;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlAuthService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final SaasAppProperties saasAppProperties;
  private final SamlAuthnRequestBuilder authnRequestBuilder;
  private final SamlAssertionValidator assertionValidator;
  private final AuthService authService;

  public OidcAuthorizeResponse beginAuth(String slug) {
    var normalized = requireSlug(slug);
    var config = requireFlowReadyConfig(normalized);
    var acsUrl = resolveAcsUrl(normalized, config);
    var spEntityId = resolveSpEntityId(normalized, config);
    var relayState = UUID.randomUUID().toString();
    var redirectUrl =
        authnRequestBuilder.buildRedirectUrl(
            config.getSsoUrl(), spEntityId, acsUrl, relayState);
    return new OidcAuthorizeResponse(redirectUrl, relayState);
  }

  public LoginResponse completeAcs(String slug, SamlAcsRequest request) {
    var normalized = requireSlug(slug);
    var config = requireFlowReadyConfig(normalized);
    var assertion = assertionValidator.validate(request.samlResponse(), config.getCertificatePem());
    var providerId = TenantSsoSamlSupport.providerId(normalized);
    return authService.loginAfterOidc(providerId, assertion.nameId(), assertion.nameId(), normalized);
  }

  private TenantSamlConfig requireFlowReadyConfig(String slug) {
    var tenant =
        tenantRepository
            .findBySlug(slug)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        samlConfigRepository
            .findByTenantId(tenant.getId())
            .orElseThrow(() -> AuthException.badRequest("Tenant SAML is not configured"));
    if (!Boolean.TRUE.equals(config.getEnabled()) || !isFlowReady(config)) {
      throw AuthException.badRequest("Tenant SAML authorization flow is not available");
    }
    return config;
  }

  private static boolean isFlowReady(TenantSamlConfig config) {
    return StringUtils.hasText(config.getEntityId()) && StringUtils.hasText(config.getSsoUrl());
  }

  private String resolveAcsUrl(String slug, TenantSamlConfig config) {
    if (StringUtils.hasText(config.getAcsUrl())) {
      return config.getAcsUrl().trim();
    }
    return trimTrailingSlash(saasAppProperties.getApp().getWebBaseUrl())
        + "/auth/tenant-sso/saml/callback/"
        + slug;
  }

  private String resolveSpEntityId(String slug, TenantSamlConfig config) {
    if (StringUtils.hasText(config.getSpEntityId())) {
      return config.getSpEntityId().trim();
    }
    return trimTrailingSlash(saasAppProperties.getApp().getWebBaseUrl()) + "/saml/" + slug;
  }

  private static String requireSlug(String slug) {
    var normalized = slug == null ? "" : slug.trim();
    if (!StringUtils.hasText(normalized)) {
      throw AuthException.badRequest("Tenant slug is required");
    }
    return normalized;
  }

  private static String trimTrailingSlash(String value) {
    if (!StringUtils.hasText(value)) {
      return "";
    }
    return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
  }
}
