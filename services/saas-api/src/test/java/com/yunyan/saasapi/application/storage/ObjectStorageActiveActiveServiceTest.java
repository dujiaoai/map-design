package com.yunyan.saasapi.application.storage;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageActiveActiveServiceTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private ObjectStorageClientFactory clientFactory;
  @Mock private ObjectStorageClient client;

  @InjectMocks private ObjectStorageActiveActiveService service;

  @Test
  void dualWrite_uploadsToPrimary() {
    when(saasAppProperties.getObjectStorage()).thenReturn(new SaasAppProperties.ObjectStorage());
    when(clientFactory.getClient()).thenReturn(client);
    service.dualWrite("key", new byte[] {1});
    verify(client).upload("key", new byte[] {1}, "application/octet-stream");
  }
}
