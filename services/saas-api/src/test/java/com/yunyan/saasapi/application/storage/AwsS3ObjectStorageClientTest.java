package com.yunyan.saasapi.application.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.yunyan.saasapi.config.SaasAppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@ExtendWith(MockitoExtension.class)
class AwsS3ObjectStorageClientTest {

  private SaasAppProperties saasAppProperties;
  private S3Client s3Client;
  private AwsS3ObjectStorageClient client;

  @BeforeEach
  void setUp() {
    saasAppProperties = new SaasAppProperties();
    var storage = saasAppProperties.getObjectStorage();
    storage.setBucket("tenant-exports");
    storage.setPublicBaseUrl("https://cdn.example/exports");
    s3Client = mock(S3Client.class);
    client = new AwsS3ObjectStorageClient(saasAppProperties);
    client.setS3Client(s3Client);
  }

  @Test
  void upload_putsObjectAndReturnsPublicUrl() {
    when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
        .thenReturn(PutObjectResponse.builder().build());

    var url = client.upload("tenant-1/pkg.zip", new byte[] {1, 2}, "application/zip");

    assertThat(url).isEqualTo("https://cdn.example/exports/tenant-1/pkg.zip");
    verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
  }
}
