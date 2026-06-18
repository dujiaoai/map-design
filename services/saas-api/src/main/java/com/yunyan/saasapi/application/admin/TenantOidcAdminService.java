package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantOidcConfigRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantOidcConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantOidcConfigDto;
import com.yunyan.saasapi.web.dto.admin.PatchTenantOidcConfigRequest;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantOidcAdminService {

  private final TenantRepository tenantRepository;
  private final TenantOidcConfigRepository oidcConfigRepository;
  private final AdminAuditLogService adminAuditLogService;

  public AdminTenantOidcConfigDto getConfig(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return oidcConfigRepository
        .findByTenantId(tenantId)
        .map(TenantOidcAdminService::toDto)
        .orElseGet(() -> emptyDto(tenantId));
  }

  @Transactional
  public AdminTenantOidcConfigDto patchConfig(
      SaasPrincipal principal, UUID tenantId, PatchTenantOidcConfigRequest request) {
    ensureTenantExists(tenantId);
    if (request.enabled() == null
        && !StringUtils.hasText(request.displayName())
        && !StringUtils.hasText(request.issuerUri())
        && !StringUtils.hasText(request.clientId())
        && !StringUtils.hasText(request.clientSecret())
        && !StringUtils.hasText(request.scopes())) {
      throw AuthException.badRequest("At least one OIDC field is required");
    }
    var config =
        oidcConfigRepository
            .findByTenantId(tenantId)
            .orElseGet(
                () -> {
                  var row = new TenantOidcConfig();
                  row.setTenantId(tenantId);
                  row.setEnabled(false);
                  row.setCreatedAt(Instant.now());
                  return row;
                });
    if (request.enabled() != null) {
      config.setEnabled(request.enabled());
    }
    if (StringUtils.hasText(request.displayName())) {
      config.setDisplayName(request.displayName().trim());
    }
    if (StringUtils.hasText(request.issuerUri())) {
      config.setIssuerUri(request.issuerUri().trim());
    }
    if (StringUtils.hasText(request.clientId())) {
      config.setClientId(request.clientId().trim());
    }
    if (StringUtils.hasText(request.clientSecret())) {
      config.setClientSecret(request.clientSecret().trim());
    }
    if (StringUtils.hasText(request.scopes())) {
      config.setScopes(request.scopes().trim());
    }
    config.setUpdatedAt(Instant.now());
    if (oidcConfigRepository.findByTenantId(tenantId).isEmpty()) {
      oidcConfigRepository.insert(config);
    } else {
      oidcConfigRepository.update(config);
    }
    adminAuditLogService.recordTenantAction(
        principal, "tenant.oidc_config.update", tenantId, "Updated tenant OIDC config skeleton");
    return toDto(config);
  }

  private void ensureTenantExists(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  static AdminTenantOidcConfigDto toDto(TenantOidcConfig config) {
    var configured =
        StringUtils.hasText(config.getIssuerUri())
            && StringUtils.hasText(config.getClientId())
            && StringUtils.hasText(config.getClientSecret());
    return new AdminTenantOidcConfigDto(
        config.getTenantId().toString(),
        Boolean.TRUE.equals(config.getEnabled()),
        config.getDisplayName(),
        config.getIssuerUri(),
        config.getClientId(),
        configured,
        StringUtils.hasText(config.getClientSecret()),
        config.getScopes());
  }

  static AdminTenantOidcConfigDto emptyDto(UUID tenantId) {
    return new AdminTenantOidcConfigDto(tenantId.toString(), false, null, null, null, false, false, null);
  }
}
