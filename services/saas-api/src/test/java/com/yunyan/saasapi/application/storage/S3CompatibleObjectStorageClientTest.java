package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class S3CompatibleObjectStorageClientTest {

  @Mock private SaasAppProperties saasAppProperties;
  @Mock private LocalObjectStorageClient localObjectStorageClient;
  @Mock private AwsS3ObjectStorageClient awsS3ObjectStorageClient;

  @InjectMocks private S3CompatibleObjectStorageClient client;

  @Test
  void upload_withPublicBaseUrl_returnsPrefixedUrl() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setPublicBaseUrl("https://cdn.example/exports");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);
    when(localObjectStorageClient.upload(eq("tenant-1/pkg.zip"), eq(new byte[] {1}), eq("application/zip")))
        .thenReturn("file:///tmp/pkg.zip");

    var url = client.upload("tenant-1/pkg.zip", new byte[] {1}, "application/zip");

    assertThat(url).isEqualTo("https://cdn.example/exports/tenant-1/pkg.zip");
  }

  @Test
  void upload_withoutPublicBaseUrl_returnsLocalResult() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setPublicBaseUrl("");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);
    when(localObjectStorageClient.upload(eq("tenant-1/pkg.zip"), eq(new byte[] {1}), eq("application/zip")))
        .thenReturn("file:///tmp/pkg.zip");

    var url = client.upload("tenant-1/pkg.zip", new byte[] {1}, "application/zip");

    assertThat(url).isEqualTo("file:///tmp/pkg.zip");
  }

  @Test
  void upload_withUseRealS3_delegatesToAwsClient() {
    var storage = new SaasAppProperties.ObjectStorage();
    storage.setProvider("s3-compatible");
    storage.setUseRealS3(true);
    storage.setEndpoint("https://minio.local:9000");
    when(saasAppProperties.getObjectStorage()).thenReturn(storage);
    when(awsS3ObjectStorageClient.upload(eq("tenant-1/pkg.zip"), eq(new byte[] {1}), eq("application/zip")))
        .thenReturn("s3://tenant-exports/tenant-1/pkg.zip");

    var url = client.upload("tenant-1/pkg.zip", new byte[] {1}, "application/zip");

    assertThat(url).isEqualTo("s3://tenant-exports/tenant-1/pkg.zip");
  }
}
