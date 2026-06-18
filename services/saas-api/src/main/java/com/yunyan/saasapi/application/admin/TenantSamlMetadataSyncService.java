package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.saml.SamlIdpMetadataClient;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlMetadataSyncService {

  private static final Logger log = LoggerFactory.getLogger(TenantSamlMetadataSyncService.class);

  private final TenantSamlConfigRepository samlConfigRepository;
  private final SamlIdpMetadataClient metadataClient;

  @Transactional
  public void syncTenant(TenantSamlConfig config) {
    if (!Boolean.TRUE.equals(config.getMetadataSyncEnabled())
        || !StringUtils.hasText(config.getMetadataUrl())) {
      return;
    }
    try {
      var metadata = metadataClient.fetchAndParse(config.getMetadataUrl());
      config.setEntityId(metadata.entityId());
      config.setSsoUrl(metadata.ssoUrl());
      if (StringUtils.hasText(metadata.certificatePem())) {
        config.setCertificatePem(metadata.certificatePem());
      }
      config.setIdpCertExpiresAt(metadata.certificateExpiresAt());
      config.setLastMetadataSyncAt(Instant.now());
      config.setUpdatedAt(Instant.now());
      samlConfigRepository.update(config);
      log.info("Synced SAML metadata for tenant {}", config.getTenantId());
    } catch (Exception ex) {
      log.warn("SAML metadata sync failed for tenant {}: {}", config.getTenantId(), ex.getMessage());
    }
  }

  public void syncAllEnabled() {
    for (var config : samlConfigRepository.listMetadataSyncEnabled()) {
      syncTenant(config);
    }
  }
}
