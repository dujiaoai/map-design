package com.yunyan.saasapi.application.admin;

import com.yunyan.saasapi.application.storage.ObjectStorageClientFactory;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportArtifactResponse;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestDto;
import com.yunyan.saasapi.web.dto.admin.TenantDataExportRequestListResponse;
import java.io.InputStream;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class TenantDataExportAdminService {

  private static final String STATUS_PENDING = "pending";
  private static final int LIST_LIMIT = 20;

  private final TenantRepository tenantRepository;
  private final TenantDataExportRequestRepository exportRequestRepository;
  private final AdminAuditLogService adminAuditLogService;
  private final ObjectStorageClientFactory objectStorageClientFactory;
  private final SaasAppProperties saasAppProperties;

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
        sanitizeArtifactUrl(request.getArtifactUrl()),
        request.getCreatedAt() != null ? request.getCreatedAt().toEpochMilli() : null,
        request.getCompletedAt() != null ? request.getCompletedAt().toEpochMilli() : null);
  }

  public TenantDataExportArtifactResponse getArtifact(UUID tenantId, UUID requestId) {
    var request = requireCompletedArtifactRequest(tenantId, requestId);
    return new TenantDataExportArtifactResponse(
        request.getId().toString(),
        sanitizeArtifactUrl(request.getArtifactUrl()),
        request.getArtifactObjectKey(),
        isDownloadable(request));
  }

  public TenantDataExportStream prepareArtifactDownload(UUID tenantId, UUID requestId) {
    var request = requireCompletedArtifactRequest(tenantId, requestId);
    if (!isDownloadable(request)) {
      throw AuthException.badRequest("Export artifact is not ready for download");
    }
    var objectKey = request.getArtifactObjectKey();
    var client = objectStorageClientFactory.client();
    if (!client.exists(objectKey)) {
      throw AuthException.notFound("Export artifact not found");
    }
    var contentLength = client.contentLength(objectKey);
    enforceMaxArtifactSize(contentLength);
    return new TenantDataExportStream(
        request.getId() + ".zip", contentLength, client.openStream(objectKey));
  }

  private void enforceMaxArtifactSize(long contentLength) {
    var maxBytes = saasAppProperties.getTenant().getDataExportMaxArtifactBytes();
    if (maxBytes > 0 && contentLength > maxBytes) {
      throw AuthException.badRequest("Export artifact exceeds maximum allowed size");
    }
  }

  private TenantDataExportRequest requireCompletedArtifactRequest(UUID tenantId, UUID requestId) {
    ensureTenantExists(tenantId);
    return exportRequestRepository
        .findById(requestId)
        .filter(row -> tenantId.equals(row.getTenantId()))
        .orElseThrow(() -> AuthException.notFound("Export request not found"));
  }

  private static boolean isDownloadable(TenantDataExportRequest request) {
    return "completed".equals(request.getStatus())
        && StringUtils.hasText(request.getArtifactObjectKey());
  }

  private static String sanitizeArtifactUrl(String artifactUrl) {
    if (!StringUtils.hasText(artifactUrl)) {
      return artifactUrl;
    }
    if (artifactUrl.startsWith("file:")) {
      return null;
    }
    return artifactUrl;
  }

  public record TenantDataExportStream(String filename, long contentLength, InputStream inputStream) {}
}
