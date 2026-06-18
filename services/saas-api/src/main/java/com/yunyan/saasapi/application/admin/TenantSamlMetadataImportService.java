package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.saml.SamlIdpMetadataClient;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantSamlMetadataImportResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlMetadataImportService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final SamlIdpMetadataClient metadataClient;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public TenantSamlMetadataImportResponse importMetadata(SaasPrincipal principal, UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        samlConfigRepository
            .findByTenantId(tenantId)
            .orElseThrow(() -> AuthException.badRequest("Tenant SAML config not found"));
    if (!StringUtils.hasText(config.getMetadataUrl())) {
      throw AuthException.badRequest("metadata_url is required before metadata import");
    }
    var metadata = metadataClient.fetchAndParse(config.getMetadataUrl());
    config.setEntityId(metadata.entityId());
    config.setSsoUrl(metadata.ssoUrl());
    if (StringUtils.hasText(metadata.certificatePem())) {
      config.setCertificatePem(metadata.certificatePem());
    }
    config.setUpdatedAt(Instant.now());
    samlConfigRepository.update(config);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_config.import_metadata", tenantId, "Imported SAML IdP metadata");
    return new TenantSamlMetadataImportResponse(
        tenantId.toString(),
        metadata.entityId(),
        metadata.ssoUrl(),
        StringUtils.hasText(metadata.certificatePem()),
        Instant.now().toEpochMilli());
  }
}
