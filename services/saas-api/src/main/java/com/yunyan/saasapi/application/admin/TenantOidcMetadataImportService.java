package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.oidc.OidcDiscoveryClient;
import com.yunyan.saasapi.domain.TenantOidcConfigRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantOidcConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantOidcMetadataImportResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantOidcMetadataImportService {

  private final TenantRepository tenantRepository;
  private final TenantOidcConfigRepository oidcConfigRepository;
  private final OidcDiscoveryClient oidcDiscoveryClient;
  private final TenantOidcCallbackUrlValidator callbackUrlValidator;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public TenantOidcMetadataImportResponse importMetadata(SaasPrincipal principal, UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        oidcConfigRepository
            .findByTenantId(tenantId)
            .orElseThrow(() -> AuthException.badRequest("Tenant OIDC config not found"));
    if (!StringUtils.hasText(config.getIssuerUri())) {
      throw AuthException.badRequest("Issuer URI is required before metadata import");
    }
    var discovery = oidcDiscoveryClient.discover(config.getIssuerUri().trim());
    config.setAuthorizationEndpoint(discovery.authorizationEndpoint());
    config.setTokenEndpoint(discovery.tokenEndpoint());
    config.setUserinfoEndpoint(discovery.userinfoEndpoint());
    config.setMetadataImportedAt(Instant.now());
    config.setUpdatedAt(Instant.now());
    oidcConfigRepository.update(config);
    var callbackUrl = callbackUrlValidator.expectedCallbackUrl(tenantId);
    adminAuditLogService.recordTenantAction(
        principal,
        "tenant.oidc_config.import_metadata",
        tenantId,
        "Imported OIDC discovery metadata");
    return new TenantOidcMetadataImportResponse(
        tenantId.toString(),
        discovery.issuer(),
        discovery.authorizationEndpoint(),
        discovery.tokenEndpoint(),
        discovery.userinfoEndpoint(),
        callbackUrl,
        config.getMetadataImportedAt().toEpochMilli());
  }
}
