package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlConfigDto;
import com.yunyan.saasapi.web.dto.admin.PatchTenantSamlConfigRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlAdminService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final AdminAuditLogService adminAuditLogService;

  public AdminTenantSamlConfigDto getConfig(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return samlConfigRepository
        .findByTenantId(tenantId)
        .map(TenantSamlAdminService::toDto)
        .orElseGet(() -> emptyDto(tenantId));
  }

  @Transactional
  public AdminTenantSamlConfigDto patchConfig(
      SaasPrincipal principal, UUID tenantId, PatchTenantSamlConfigRequest request) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    if (request.enabled() == null
        && !StringUtils.hasText(request.entityId())
        && !StringUtils.hasText(request.ssoUrl())
        && !StringUtils.hasText(request.acsUrl())
        && !StringUtils.hasText(request.spEntityId())
        && !StringUtils.hasText(request.certificatePem())
        && !StringUtils.hasText(request.metadataUrl())
        && request.metadataSyncEnabled() == null) {
      throw AuthException.badRequest("At least one SAML field is required");
    }
    var config =
        samlConfigRepository
            .findByTenantId(tenantId)
            .orElseGet(
                () -> {
                  var row = new TenantSamlConfig();
                  row.setTenantId(tenantId);
                  row.setEnabled(false);
                  row.setCreatedAt(Instant.now());
                  return row;
                });
    if (request.enabled() != null) {
      config.setEnabled(request.enabled());
    }
    if (StringUtils.hasText(request.entityId())) {
      config.setEntityId(request.entityId().trim());
    }
    if (StringUtils.hasText(request.ssoUrl())) {
      config.setSsoUrl(request.ssoUrl().trim());
    }
    if (StringUtils.hasText(request.acsUrl())) {
      config.setAcsUrl(request.acsUrl().trim());
    }
    if (StringUtils.hasText(request.spEntityId())) {
      config.setSpEntityId(request.spEntityId().trim());
    }
    if (StringUtils.hasText(request.certificatePem())) {
      config.setCertificatePem(request.certificatePem().trim());
    }
    if (StringUtils.hasText(request.metadataUrl())) {
      config.setMetadataUrl(request.metadataUrl().trim());
    }
    if (request.metadataSyncEnabled() != null) {
      config.setMetadataSyncEnabled(request.metadataSyncEnabled());
    }
    config.setUpdatedAt(Instant.now());
    if (samlConfigRepository.findByTenantId(tenantId).isEmpty()) {
      samlConfigRepository.insert(config);
    } else {
      samlConfigRepository.update(config);
    }
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_config.update", tenantId, "Updated tenant SAML config");
    return toDto(config);
  }

  static AdminTenantSamlConfigDto toDto(TenantSamlConfig config) {
    var configured =
        StringUtils.hasText(config.getEntityId()) && StringUtils.hasText(config.getSsoUrl());
    return new AdminTenantSamlConfigDto(
        config.getTenantId().toString(),
        Boolean.TRUE.equals(config.getEnabled()),
        config.getEntityId(),
        config.getSsoUrl(),
        config.getAcsUrl(),
        config.getSpEntityId(),
        StringUtils.hasText(config.getCertificatePem()),
        config.getMetadataUrl(),
        StringUtils.hasText(config.getSpCertificatePem()),
        config.getSpCertificateExpiresAt() == null
            ? null
            : config.getSpCertificateExpiresAt().toEpochMilli(),
        config.getIdpCertExpiresAt() == null ? null : config.getIdpCertExpiresAt().toEpochMilli(),
        Boolean.TRUE.equals(config.getMetadataSyncEnabled()),
        config.getLastMetadataSyncAt() == null ? null : config.getLastMetadataSyncAt().toEpochMilli(),
        configured);
  }

  static AdminTenantSamlConfigDto emptyDto(UUID tenantId) {
    return new AdminTenantSamlConfigDto(
        tenantId.toString(), false, null, null, null, null, false, null, false, null, null, false, null, false);
  }
}
