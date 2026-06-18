package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantOidcConfigRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantOidcConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantOidcConfigDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantOidcAdminService {

  private final TenantRepository tenantRepository;
  private final TenantOidcConfigRepository oidcConfigRepository;

  public AdminTenantOidcConfigDto getConfig(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return oidcConfigRepository
        .findByTenantId(tenantId)
        .map(TenantOidcAdminService::toDto)
        .orElseGet(() -> emptyDto(tenantId));
  }

  static AdminTenantOidcConfigDto toDto(TenantOidcConfig config) {
    var configured =
        StringUtils.hasText(config.getIssuerUri()) && StringUtils.hasText(config.getClientId());
    return new AdminTenantOidcConfigDto(
        config.getTenantId().toString(),
        Boolean.TRUE.equals(config.getEnabled()),
        config.getDisplayName(),
        config.getIssuerUri(),
        config.getClientId(),
        configured);
  }

  static AdminTenantOidcConfigDto emptyDto(UUID tenantId) {
    return new AdminTenantOidcConfigDto(tenantId.toString(), false, null, null, null, false);
  }
}
