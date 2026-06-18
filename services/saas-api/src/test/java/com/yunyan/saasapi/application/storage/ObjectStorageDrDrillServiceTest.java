package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.application.admin.AdminAuditLogService;
import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageDrDrillLogRepository;
import com.yunyan.saasapi.security.SaasPrincipal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageDrDrillServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private ObjectStorageClient objectStorageClient;
  @Mock private ObjectStorageDrDrillLogRepository drillLogRepository;
  @Mock private AdminAuditLogService adminAuditLogService;

  @InjectMocks private ObjectStorageDrDrillService service;

  @Test
  void executeDrill_skipsWhenBucketNotConfigured() {
    when(saasAppProperties.getObjectStorage()).thenReturn(new SaasAppProperties.ObjectStorage());

    var response = service.executeDrill(principal());

    assertThat(response.status()).isEqualTo("skipped");
    verify(drillLogRepository).insert(any());
  }

  private static SaasPrincipal principal() {
    return new SaasPrincipal(
        UUID.randomUUID(), UUID.randomUUID(), null, "admin@test", List.of(), List.of(), null, null);
  }
}
