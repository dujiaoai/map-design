package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ScimProvisioningTokenRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantScimProvisioningDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ScimProvisioningAdminService {

  private final TenantRepository tenantRepository;
  private final ScimProvisioningTokenRepository tokenRepository;
  private final SaasAppProperties saasAppProperties;

  public AdminTenantScimProvisioningDto getStatus(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return tokenRepository
        .findByTenantId(tenantId)
        .map(token -> toDto(tenantId, token.getEnabled(), StringUtils.hasText(token.getTokenHash())))
        .orElseGet(() -> toDto(tenantId, false, false));
  }

  private AdminTenantScimProvisioningDto toDto(UUID tenantId, Boolean enabled, boolean tokenConfigured) {
    var base = saasAppProperties.getApp().getWebBaseUrl();
    if (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }
    return new AdminTenantScimProvisioningDto(
        tenantId.toString(),
        Boolean.TRUE.equals(enabled),
        tokenConfigured,
        base + "/scim/v2/Users");
  }
}
