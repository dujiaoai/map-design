package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageRpoMetricRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageRpoMonitorServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private ObjectStorageRpoMetricRepository metricRepository;

  @InjectMocks private ObjectStorageRpoMonitorService service;

  @Test
  void getLatestStatus_whenActiveActive_reportsLag() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setActiveActiveEnabled(true);
    storage.setSecondaryRegion("us-west-2");
    storage.setRpoTargetSeconds(300);
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);
    var status = service.getLatestStatus();
    assertThat(status.activeActiveEnabled()).isTrue();
    assertThat(status.replicationLagSeconds()).isGreaterThanOrEqualTo(0);
  }
}
