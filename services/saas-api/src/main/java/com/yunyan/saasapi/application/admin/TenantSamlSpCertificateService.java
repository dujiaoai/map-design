package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.auth.saml.SelfSignedSpCertificateGenerator;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlConfigRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlConfig;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantSamlSpCertificateRotateResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TenantSamlSpCertificateService {

  private static final int VALID_DAYS = 365;

  private final TenantRepository tenantRepository;
  private final TenantSamlConfigRepository samlConfigRepository;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public TenantSamlSpCertificateRotateResponse rotateCertificate(
      SaasPrincipal principal, UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var config =
        samlConfigRepository
            .findByTenantId(tenantId)
            .orElseGet(() -> newConfig(tenantId));
    var generated = SelfSignedSpCertificateGenerator.generate("tenant-" + tenantId + "-sp", VALID_DAYS);
    config.setSpCertificatePem(generated.certificatePem());
    config.setSpCertificateExpiresAt(generated.expiresAt());
    config.setUpdatedAt(Instant.now());
    if (samlConfigRepository.findByTenantId(tenantId).isEmpty()) {
      samlConfigRepository.insert(config);
    } else {
      samlConfigRepository.update(config);
    }
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_config.rotate_sp_certificate", tenantId, "Rotated SP signing certificate");
    return new TenantSamlSpCertificateRotateResponse(
        tenantId.toString(), generated.expiresAt().toEpochMilli());
  }

  private static TenantSamlConfig newConfig(UUID tenantId) {
    var row = new TenantSamlConfig();
    row.setTenantId(tenantId);
    row.setEnabled(false);
    row.setCreatedAt(Instant.now());
    return row;
  }
}
