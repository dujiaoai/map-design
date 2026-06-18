package com.yunyan.saasapi.application.storage;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageLifecycleAuditRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageLifecycleServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private ObjectStorageLifecycleAuditRepository auditRepository;

  @InjectMocks private ObjectStorageLifecycleService service;

  @Test
  void recordRetentionPolicy_writesAuditWhenConfigured() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setComplianceRetainDays(30);
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);

    service.recordRetentionPolicy("exports/demo.zip");

    verify(auditRepository).insert(org.mockito.ArgumentMatchers.argThat(row -> row.getExpireDays() == 30));
  }
}
