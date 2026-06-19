package com.yunyan.saasapi.application.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.storage.ObjectStorageClient;
import com.yunyan.saasapi.application.storage.ObjectStorageClientFactory;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import com.yunyan.saasapi.security.AuthException;
import com.yunyan.saasapi.security.SaasPrincipal;
import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantDataExportAdminServiceTest {

  private static final UUID TENANT_ID = UUID.fromString("51c2f0ab-b433-4301-805a-08b073fd0b84");
  private static final UUID REQUEST_ID = UUID.fromString("a288a157-add3-47e8-a714-b18dc93db71e");

  @Mock private TenantRepository tenantRepository;
  @Mock private TenantDataExportRequestRepository exportRequestRepository;
  @Mock private AdminAuditLogService adminAuditLogService;
  @Mock private ObjectStorageClientFactory objectStorageClientFactory;
  @Mock private ObjectStorageClient objectStorageClient;

  private final SaasAppProperties saasAppProperties = new SaasAppProperties();

  private TenantDataExportAdminService service;

  @Mock private AdminDataExportRateLimitService adminDataExportRateLimitService;

  @BeforeEach
  void setUp() {
    service =
        new TenantDataExportAdminService(
            tenantRepository,
            exportRequestRepository,
            adminAuditLogService,
            objectStorageClientFactory,
            saasAppProperties,
            adminDataExportRateLimitService);
  }

  @Test
  void prepareArtifactDownload_completedRequest_returnsStreamMetadata() throws Exception {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));

    var request = completedRequest();
    when(exportRequestRepository.findById(REQUEST_ID)).thenReturn(Optional.of(request));
    when(objectStorageClientFactory.client()).thenReturn(objectStorageClient);
    when(objectStorageClient.exists(request.getArtifactObjectKey())).thenReturn(true);
    when(objectStorageClient.contentLength(request.getArtifactObjectKey())).thenReturn(3L);
    when(objectStorageClient.openStream(request.getArtifactObjectKey()))
        .thenReturn(new ByteArrayInputStream(new byte[] {1, 2, 3}));

    var download = service.prepareArtifactDownload(platformPrincipal(), TENANT_ID, REQUEST_ID);

    assertThat(download.filename()).isEqualTo(REQUEST_ID + ".zip");
    assertThat(download.contentLength()).isEqualTo(3L);
    assertThat(download.inputStream().readAllBytes()).containsExactly(1, 2, 3);
    verify(objectStorageClient).openStream(eq(request.getArtifactObjectKey()));
    verify(adminAuditLogService)
        .recordTenantAction(
            any(SaasPrincipal.class),
            eq("tenant.data_export.download"),
            eq(TENANT_ID),
            eq("requestId=" + REQUEST_ID + " bytes=3"));
  }

  @Test
  void prepareArtifactDownload_exceedsMaxSize_rejected() {
    saasAppProperties.getTenant().setDataExportMaxArtifactBytes(2L);
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));

    var request = completedRequest();
    when(exportRequestRepository.findById(REQUEST_ID)).thenReturn(Optional.of(request));
    when(objectStorageClientFactory.client()).thenReturn(objectStorageClient);
    when(objectStorageClient.exists(request.getArtifactObjectKey())).thenReturn(true);
    when(objectStorageClient.contentLength(request.getArtifactObjectKey())).thenReturn(3L);

    assertThatThrownBy(() -> service.prepareArtifactDownload(platformPrincipal(), TENANT_ID, REQUEST_ID))
        .isInstanceOf(AuthException.class);
  }

  @Test
  void getArtifact_localFileUrl_isSanitizedAndDownloadable() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));
    when(exportRequestRepository.findById(REQUEST_ID)).thenReturn(Optional.of(completedRequest()));

    var artifact = service.getArtifact(TENANT_ID, REQUEST_ID);

    assertThat(artifact.artifactUrl()).isNull();
    assertThat(artifact.downloadable()).isTrue();
  }

  @Test
  void prepareArtifactDownload_pendingRequest_rejected() {
    var tenant = new SysTenant();
    tenant.setId(TENANT_ID);
    when(tenantRepository.findById(TENANT_ID)).thenReturn(Optional.of(tenant));

    var request = completedRequest();
    request.setStatus("pending");
    when(exportRequestRepository.findById(REQUEST_ID)).thenReturn(Optional.of(request));

    assertThatThrownBy(() -> service.prepareArtifactDownload(platformPrincipal(), TENANT_ID, REQUEST_ID))
        .isInstanceOf(AuthException.class);
  }

  private static SaasPrincipal platformPrincipal() {
    return new SaasPrincipal(
        UUID.randomUUID(),
        TENANT_ID,
        null,
        "admin@demo.local",
        List.of("PLATFORM_ADMIN"),
        List.of("admin:tenants:read"),
        "jti",
        Instant.now().plusSeconds(900));
  }

  private static TenantDataExportRequest completedRequest() {
    var request = new TenantDataExportRequest();
    request.setId(REQUEST_ID);
    request.setTenantId(TENANT_ID);
    request.setStatus("completed");
    request.setArtifactObjectKey(TENANT_ID + "/" + REQUEST_ID + ".zip");
    request.setArtifactUrl("file:///tmp/export.zip");
    request.setCreatedAt(Instant.now());
    request.setCompletedAt(Instant.now());
    return request;
  }
}
