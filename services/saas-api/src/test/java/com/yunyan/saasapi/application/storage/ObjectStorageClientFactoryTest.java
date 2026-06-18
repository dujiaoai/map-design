package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ObjectStorageClientFactoryTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private LocalObjectStorageClient localObjectStorageClient;
  @Mock private S3CompatibleObjectStorageClient s3CompatibleObjectStorageClient;

  @InjectMocks private ObjectStorageClientFactory factory;

  @Test
  void client_localProvider_returnsLocalClient() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setProvider("local");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);

    assertThat(factory.client()).isSameAs(localObjectStorageClient);
  }

  @Test
  void client_s3WithoutEndpoint_fallsBackToLocal() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setProvider("s3-compatible");
    storage.setEndpoint("");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);

    assertThat(factory.client()).isSameAs(localObjectStorageClient);
  }

  @Test
  void client_s3WithEndpoint_returnsS3Client() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setProvider("s3-compatible");
    storage.setEndpoint("https://minio.example:9000");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);

    assertThat(factory.client()).isSameAs(s3CompatibleObjectStorageClient);
  }
}
