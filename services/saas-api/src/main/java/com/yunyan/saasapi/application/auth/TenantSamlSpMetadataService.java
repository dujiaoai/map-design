package com.yunyan.saasapi.application.auth;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class TenantSamlSpMetadataService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final SaasAppProperties saasAppProperties;

  public TenantSamlSpMetadataService(
      TenantRepository tenantRepository,
      TenantSamlConfigRepository samlConfigRepository,
      SaasAppProperties saasAppProperties) {
    this.tenantRepository = tenantRepository;
    this.samlConfigRepository = samlConfigRepository;
    this.saasAppProperties = saasAppProperties;
  }

  public String buildMetadataXml(String slug) {
    var normalized = requireSlug(slug);
    var tenant =
        tenantRepository
            .findBySlug(normalized)
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        samlConfigRepository
            .findByTenantId(tenant.getId())
            .orElseThrow(() -> AuthException.badRequest("Tenant SAML is not configured"));
    if (!Boolean.TRUE.equals(config.getEnabled())) {
      throw AuthException.badRequest("Tenant SAML is not enabled");
    }
    var spEntityId = resolveSpEntityId(normalized, config);
    var acsUrl = resolveAcsUrl(normalized, config);
    var certPem = resolveSpCertificate(config);
    var certBody = certPem.replace("-----BEGIN CERTIFICATE-----", "")
        .replace("-----END CERTIFICATE-----", "")
        .replaceAll("\\s+", "");
    return """
        <?xml version="1.0" encoding="UTF-8"?>
        <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="%s">
          <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
            <md:KeyDescriptor use="signing">
              <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                  <ds:X509Certificate>%s</ds:X509Certificate>
                </ds:X509Data>
              </ds:KeyInfo>
            </md:KeyDescriptor>
            <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="%s" index="0"/>
          </md:SPSSODescriptor>
        </md:EntityDescriptor>
        """
        .formatted(spEntityId, certBody, acsUrl)
        .trim();
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
    return trimTrailingSlash(saasAppProperties.getApp().getWebBaseUrl())
        + "/auth/tenant-sso/saml/"
        + slug;
  }

  private static String resolveSpCertificate(TenantSamlConfig config) {
    if (StringUtils.hasText(config.getSpCertificatePem())) {
      return config.getSpCertificatePem().trim();
    }
    throw AuthException.badRequest("SP certificate is not configured");
  }

  private static String requireSlug(String slug) {
    if (!StringUtils.hasText(slug)) {
      throw AuthException.badRequest("Tenant slug is required");
    }
    return slug.trim().toLowerCase();
  }

  private static String trimTrailingSlash(String url) {
    return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
  }
}
