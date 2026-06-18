package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpFederationRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpFederation;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.CreateTenantSamlIdpFederationRequest;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpFederationDto;
import com.yunyan.saasapi.web.dto.admin.TenantSamlIdpFederationListResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlIdpFederationAdminService {

  private final TenantRepository tenantRepository;
  private final TenantSamlIdpFederationRepository federationRepository;
  private final AdminAuditLogService adminAuditLogService;

  public TenantSamlIdpFederationListResponse list(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var items =
        federationRepository.listByTenantId(tenantId).stream().map(TenantSamlIdpFederationAdminService::toDto).toList();
    return new TenantSamlIdpFederationListResponse(items);
  }

  @Transactional
  public TenantSamlIdpFederationDto add(
      SaasPrincipal principal, UUID tenantId, CreateTenantSamlIdpFederationRequest request) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    if (!StringUtils.hasText(request.idpEntityId()) || !StringUtils.hasText(request.ssoUrl())) {
      throw AuthException.badRequest("idpEntityId and ssoUrl are required");
    }
    var row = new TenantSamlIdpFederation();
    row.setId(UUID.randomUUID());
    row.setTenantId(tenantId);
    row.setIdpEntityId(request.idpEntityId().trim());
    row.setSsoUrl(request.ssoUrl().trim());
    if (StringUtils.hasText(request.certificatePem())) {
      row.setCertificatePem(request.certificatePem().trim());
    }
    row.setPriority(request.priority() == null ? 0 : request.priority());
    row.setEnabled(request.enabled() == null ? Boolean.TRUE : request.enabled());
    var now = Instant.now();
    row.setCreatedAt(now);
    row.setUpdatedAt(now);
    federationRepository.insert(row);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_idp_federation.add", tenantId, "Added federation IdP " + row.getIdpEntityId());
    return toDto(row);
  }

  @Transactional
  public void remove(SaasPrincipal principal, UUID tenantId, UUID federationId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var row =
        federationRepository
            .findById(federationId)
            .orElseThrow(() -> AuthException.notFound("Federation IdP not found"));
    if (!row.getTenantId().equals(tenantId)) {
      throw AuthException.notFound("Federation IdP not found");
    }
    federationRepository.deleteById(federationId);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_idp_federation.remove", tenantId, "Removed federation IdP " + row.getIdpEntityId());
  }

  static TenantSamlIdpFederationDto toDto(TenantSamlIdpFederation row) {
    return new TenantSamlIdpFederationDto(
        row.getId().toString(),
        row.getTenantId().toString(),
        row.getIdpEntityId(),
        row.getSsoUrl(),
        StringUtils.hasText(row.getCertificatePem()),
        row.getPriority() == null ? 0 : row.getPriority(),
        Boolean.TRUE.equals(row.getEnabled()),
        row.getCreatedAt() == null ? 0L : row.getCreatedAt().toEpochMilli(),
        row.getUpdatedAt() == null ? 0L : row.getUpdatedAt().toEpochMilli());
  }
}
