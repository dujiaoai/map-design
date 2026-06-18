package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import com.yunyan.saasapi.domain.ObjectStorageConsistencyCheckLogRepository;
import com.yunyan.saasapi.security.SaasPrincipal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageConsistencyCheckServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private ObjectStorageConsistencyCheckLogRepository checkLogRepository;

  @InjectMocks private ObjectStorageConsistencyCheckService service;

  @Test
  void runCheck_persistsLogRow() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setReplicationTargetBucket("replica-bucket");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);
    var principal =
        new SaasPrincipal(
            UUID.randomUUID(), UUID.randomUUID(), null, "admin@test.local", List.of(), List.of(), null, null);

    var response = service.runCheck(principal);

    assertThat(response.objectsChecked()).isEqualTo(1);
    verify(checkLogRepository).insert(org.mockito.ArgumentMatchers.any());
  }
}
