package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.TenantSamlIdpRegistrationRepository;
import com.yunyan.saasapi.domain.entity.TenantSamlIdpRegistration;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlIdpApproveResponse;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlIdpRegistrationDto;
import com.yunyan.saasapi.web.dto.admin.AdminTenantSamlIdpRegistrationListResponse;
import com.yunyan.saasapi.web.dto.auth.SamlIdpRegisterRequest;
import com.yunyan.saasapi.web.dto.auth.SamlIdpRegisterResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantSamlIdpRegistrationService {

  private final TenantRepository tenantRepository;
  private final TenantSamlIdpRegistrationRepository registrationRepository;
  private final AdminAuditLogService adminAuditLogService;

  @Transactional
  public SamlIdpRegisterResponse registerPublic(String slug, SamlIdpRegisterRequest request) {
    var tenant =
        tenantRepository
            .findBySlug(requireSlug(slug))
            .orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var tokenHash = hashToken(request.registrationToken());
    var existing = registrationRepository.findByTokenHash(tokenHash);
    if (existing.isPresent()) {
      var row = existing.get();
      if (!row.getTenantId().equals(tenant.getId())) {
        throw AuthException.badRequest("Invalid registration token");
      }
      row.setIdpEntityId(request.idpEntityId().trim());
      row.setUpdatedAt(Instant.now());
      registrationRepository.update(row);
      return new SamlIdpRegisterResponse(row.getId().toString(), row.getStatus());
    }
    var row = new TenantSamlIdpRegistration();
    row.setId(UUID.randomUUID());
    row.setTenantId(tenant.getId());
    row.setRegistrationTokenHash(tokenHash);
    row.setIdpEntityId(request.idpEntityId().trim());
    row.setStatus("pending");
    row.setCreatedAt(Instant.now());
    row.setUpdatedAt(Instant.now());
    registrationRepository.insert(row);
    return new SamlIdpRegisterResponse(row.getId().toString(), row.getStatus());
  }

  public AdminTenantSamlIdpRegistrationListResponse listPending(SaasPrincipal principal, UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var rows = registrationRepository.findPendingByTenantId(tenantId);
    return new AdminTenantSamlIdpRegistrationListResponse(
        rows.stream().map(this::toDto).toList());
  }

  @Transactional
  public AdminTenantSamlIdpApproveResponse approve(
      SaasPrincipal principal, UUID tenantId, UUID registrationId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
    var row =
        registrationRepository
            .findById(registrationId)
            .filter(r -> r.getTenantId().equals(tenantId))
            .orElseThrow(() -> AuthException.notFound("Registration not found"));
    if (!"pending".equals(row.getStatus())) {
      throw AuthException.badRequest("Registration is not pending");
    }
    row.setStatus("approved");
    row.setUpdatedAt(Instant.now());
    registrationRepository.update(row);
    adminAuditLogService.recordTenantAction(
        principal, "tenant.saml_idp_registration.approve", tenantId, "Approved IdP registration");
    return new AdminTenantSamlIdpApproveResponse(row.getId().toString(), row.getStatus());
  }

  private AdminTenantSamlIdpRegistrationDto toDto(TenantSamlIdpRegistration row) {
    return new AdminTenantSamlIdpRegistrationDto(
        row.getId().toString(),
        row.getIdpEntityId(),
        row.getStatus(),
        row.getCreatedAt().toEpochMilli());
  }

  static String hashToken(String token) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      var hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
      return HexFormat.of().formatHex(hash);
    } catch (Exception ex) {
      throw new IllegalStateException("Failed to hash registration token", ex);
    }
  }

  private static String requireSlug(String slug) {
    if (!StringUtils.hasText(slug)) {
      throw AuthException.badRequest("Tenant slug is required");
    }
    return slug.trim().toLowerCase();
  }
}
