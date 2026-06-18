package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.application.auth.saml.SamlAssertionValidator;
import com.yunyan.saasapi.application.auth.saml.SamlAuthnRequestBuilder;
import com.yunyan.saasapi.application.auth.saml.TenantSamlIdpFederationSelector;
import com.yunyan.saasapi.application.auth.saml.TenantSsoSamlSupport;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpFederation;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.auth.LoginResponse;
import com.yunyan.saasapi.web.dto.auth.OidcAuthorizeResponse;
import com.yunyan.saasapi.web.dto.auth.SamlAcsRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlAuthService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final TenantSamlIdpFederationSelector federationSelector;
  private final SaasAppProperties saasAppProperties;
  private final SamlAuthnRequestBuilder authnRequestBuilder;
  private final SamlAssertionValidator assertionValidator;
  private final AuthService authService;

  public OidcAuthorizeResponse beginAuth(String slug) {
    var normalized = requireSlug(slug);
    var tenant =
        tenantRepository
            .findBySlug(normalized)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config = requireFlowReadyConfig(normalized);
    var acsUrl = resolveAcsUrl(normalized, config);
    var spEntityId = resolveSpEntityId(normalized, config);
    var federation = federationSelector.listCandidates(tenant.getId());
    var target = selectIdpTarget(config, federation, null);
    var relayState = target.federationId() != null ? target.federationId().toString() : UUID.randomUUID().toString();
    var redirectUrl =
        authnRequestBuilder.buildRedirectUrl(
            target.ssoUrl(), spEntityId, acsUrl, relayState);
    return new OidcAuthorizeResponse(redirectUrl, relayState);
  }

  public LoginResponse completeAcs(String slug, SamlAcsRequest request) {
    var normalized = requireSlug(slug);
    var tenant =
        tenantRepository
            .findBySlug(normalized)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config = requireFlowReadyConfig(normalized);
    var federation = federationSelector.listCandidates(tenant.getId());
    var assertion = validateWithFederationFallback(request, config, federation, request.relayState());
    var providerId = TenantSsoSamlSupport.providerId(normalized);
    return authService.loginAfterOidc(providerId, assertion.nameId(), assertion.nameId(), normalized);
  }

  private com.yunyan.saasapi.application.auth.saml.SamlAssertionValidator.ValidatedAssertion validateWithFederationFallback(
      SamlAcsRequest request,
      TenantSamlConfig config,
      List<TenantSamlIdpFederation> federation,
      String relayState) {
    var targets = buildIdpTargets(config, federation);
    var selected =
        federationSelector.selectByRelayState(config.getTenantId(), relayState).map(TenantSamlIdpFederation::getId);
    if (selected.isPresent()) {
      targets =
          targets.stream()
              .filter(t -> t.federationId() != null && t.federationId().equals(selected.get()))
              .toList();
    }
    AuthException lastError = null;
    for (var target : targets) {
      if (!StringUtils.hasText(target.certificatePem())) {
        continue;
      }
      try {
        return assertionValidator.validate(request.samlResponse(), target.certificatePem());
      } catch (AuthException ex) {
        lastError = ex;
      }
    }
    if (lastError != null) {
      throw lastError;
    }
    throw AuthException.badRequest("No valid IdP certificate for SAML assertion");
  }

  private static List<IdpTarget> buildIdpTargets(
      TenantSamlConfig config, List<TenantSamlIdpFederation> federation) {
    List<IdpTarget> targets = new ArrayList<>();
    for (var fed : federation) {
      targets.add(
          new IdpTarget(
              fed.getId(),
              fed.getSsoUrl(),
              fed.getCertificatePem()));
    }
    if (StringUtils.hasText(config.getCertificatePem())) {
      targets.add(new IdpTarget(null, config.getSsoUrl(), config.getCertificatePem()));
    }
    return targets;
  }

  private static IdpTarget selectIdpTarget(
      TenantSamlConfig config, List<TenantSamlIdpFederation> federation, String relayState) {
    if (StringUtils.hasText(relayState)) {
      for (var fed : federation) {
        if (relayState.equals(fed.getId().toString())) {
          return new IdpTarget(fed.getId(), fed.getSsoUrl(), fed.getCertificatePem());
        }
      }
    }
    if (!federation.isEmpty()) {
      var fed = federation.get(0);
      return new IdpTarget(fed.getId(), fed.getSsoUrl(), fed.getCertificatePem());
    }
    return new IdpTarget(null, config.getSsoUrl(), config.getCertificatePem());
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

  private record IdpTarget(UUID federationId, String ssoUrl, String certificatePem) {}
}
