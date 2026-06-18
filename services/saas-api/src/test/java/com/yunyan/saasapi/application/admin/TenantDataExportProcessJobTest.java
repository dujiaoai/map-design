package com.yunyan.saasapi.application.admin;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.domain.TenantDataExportRequestRepository;
import com.yunyan.saasapi.domain.entity.TenantDataExportRequest;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TenantDataExportProcessJobTest {

  @Mock private TenantDataExportRequestRepository exportRequestRepository;

  @InjectMocks private TenantDataExportProcessJob job;

  @Test
  void processPendingExports_marksProcessing() {
    var request = new TenantDataExportRequest();
    request.setId(UUID.randomUUID());
    request.setStatus("pending");
    when(exportRequestRepository.findPending("pending", 20)).thenReturn(List.of(request));

    job.processPendingExports();

    verify(exportRequestRepository).update(request);
    org.junit.jupiter.api.Assertions.assertEquals("processing", request.getStatus());
  }
}
