package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlConfigDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlAdminService {

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;

  public AdminTenantSamlConfigDto getConfig(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    return samlConfigRepository
        .findByTenantId(tenantId)
        .map(TenantSamlAdminService::toDto)
        .orElseGet(() -> emptyDto(tenantId));
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
        configured);
  }

  static AdminTenantSamlConfigDto emptyDto(UUID tenantId) {
    return new AdminTenantSamlConfigDto(tenantId.toString(), false, null, null, null, null, false, false);
  }
}
