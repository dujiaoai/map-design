package com.yunyan.saasapi.application.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.storage.ObjectStorageClient;
import com.yunyan.saasapi.application.storage.ObjectStorageClientFactory;
import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.TenantRepository;
import com.yunyan.saasapi.domain.entity.SysTenant;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantDataExportCompleteJobTest {

  @Mock private TenantDataExportRequestRepository exportRequestRepository;
  @Mock private TenantDataExportCollector exportCollector;
  @Mock private TenantDataExportZipBuilder exportZipBuilder;
  @Mock private ObjectStorageClientFactory objectStorageClientFactory;
  @Mock private ObjectStorageClient objectStorageClient;

  @InjectMocks private TenantDataExportCompleteJob job;

  @Test
  void completeProcessingExports_uploadsArtifactAndMarksCompleted() {
    var tenantId = UUID.randomUUID();
    var request = new TenantDataExportRequest();
    request.setId(UUID.randomUUID());
    request.setTenantId(tenantId);
    request.setStatus("processing");
    when(exportRequestRepository.findPending("processing", 20)).thenReturn(List.of(request));
    when(exportCollector.collect(eq(tenantId), eq(request))).thenReturn(Map.of("tenantId", tenantId.toString()));
    when(exportZipBuilder.buildZip(any())).thenReturn(new byte[] {1, 2, 3});
    when(objectStorageClientFactory.client()).thenReturn(objectStorageClient);
    when(objectStorageClient.upload(any(), any(), eq("application/zip")))
        .thenReturn("file:///tmp/export.zip");

    job.completeProcessingExports();

    verify(exportRequestRepository).update(request);
    Assertions.assertEquals("completed", request.getStatus());
    Assertions.assertEquals("file:///tmp/export.zip", request.getArtifactUrl());
    Assertions.assertNotNull(request.getArtifactObjectKey());
  }
}
