package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestDto;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestListResponse;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportArtifactResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TenantDataExportAdminService {

  private static final String STATUS_PENDING = "pending";
  private static final int LIST_LIMIT = 20;

  private final TenantRepository tenantRepository;
  private final TenantDataExportRequestRepository exportRequestRepository;
  private final AdminAuditLogService adminAuditLogService;

  public TenantDataExportRequestListResponse listRequests(UUID tenantId) {
    ensureTenantExists(tenantId);
    var requests =
        exportRequestRepository.findByTenantId(tenantId, LIST_LIMIT).stream()
            .map(TenantDataExportAdminService::toDto)
            .toList();
    return new TenantDataExportRequestListResponse(requests);
  }

  @Transactional
  public TenantDataExportRequestDto createRequest(SaasPrincipal principal, UUID tenantId) {
    ensureTenantExists(tenantId);
    var request = new TenantDataExportRequest();
    request.setId(UUID.randomUUID());
    request.setTenantId(tenantId);
    request.setStatus(STATUS_PENDING);
    request.setRequestedByUserId(principal.userId());
    request.setCreatedAt(Instant.now());
    exportRequestRepository.insert(request);
    adminAuditLogService.recordTenantAction(
        principal,
        "tenant.data_export.request",
        tenantId,
        "Queued GDPR-style data export request " + request.getId());
    return toDto(request);
  }

  private void ensureTenantExists(UUID tenantId) {
    tenantRepository.findById(tenantId).orElseThrow(() -> AuthException.notFound("Tenant not found"));
  }

  static TenantDataExportRequestDto toDto(TenantDataExportRequest request) {
    return new TenantDataExportRequestDto(
        request.getId().toString(),
        request.getTenantId().toString(),
        request.getStatus(),
        request.getRequestedByUserId() != null ? request.getRequestedByUserId().toString() : null,
        request.getArtifactUrl(),
        request.getCreatedAt() != null ? request.getCreatedAt().toEpochMilli() : null,
        request.getCompletedAt() != null ? request.getCompletedAt().toEpochMilli() : null);
  }

  public TenantDataExportArtifactResponse getArtifact(UUID tenantId, UUID requestId) {
    ensureTenantExists(tenantId);
    var request =
        exportRequestRepository
            .findById(requestId)
            .filter(row -> tenantId.equals(row.getTenantId()))
            .orElseThrow(() -> AuthException.notFound("Export request not found"));
    var downloadable =
        "completed".equals(request.getStatus())
            && org.springframework.util.StringUtils.hasText(request.getArtifactUrl());
    return new TenantDataExportArtifactResponse(
        request.getId().toString(), request.getArtifactUrl(), downloadable);
  }
}
