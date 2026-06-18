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
    var lifecycleService = mock(ObjectStorageLifecycleService.class);
    client = new AwsS3ObjectStorageClient(saasAppProperties, lifecycleService);
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

  @Test
  void uploadLarge_usesMultipartWhenAboveThreshold() {
    saasAppProperties.getObjectStorage().setMultipartThresholdBytes(4);
    when(s3Client.createMultipartUpload(any(software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest.class)))
        .thenReturn(
            software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse.builder()
                .uploadId("upload-1")
                .build());
    when(s3Client.uploadPart(
            any(software.amazon.awssdk.services.s3.model.UploadPartRequest.class), any(RequestBody.class)))
        .thenReturn(
            software.amazon.awssdk.services.s3.model.UploadPartResponse.builder().eTag("etag-1").build());
    when(s3Client.completeMultipartUpload(
            any(software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest.class)))
        .thenReturn(
            software.amazon.awssdk.services.s3.model.CompleteMultipartUploadResponse.builder().build());

    var payload = new byte[] {1, 2, 3, 4, 5};
    var url =
        client.uploadLarge(
            "tenant-1/large.zip", new java.io.ByteArrayInputStream(payload), payload.length, "application/zip");

    assertThat(url).contains("tenant-1/large.zip");
    verify(s3Client).createMultipartUpload(any(software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest.class));
  }

  @Test
  void upload_replicatesWhenTargetBucketConfigured() {
    saasAppProperties.getObjectStorage().setReplicationTargetBucket("replica-bucket");
    when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
        .thenReturn(PutObjectResponse.builder().build());
    when(s3Client.copyObject(any(software.amazon.awssdk.services.s3.model.CopyObjectRequest.class)))
        .thenReturn(software.amazon.awssdk.services.s3.model.CopyObjectResponse.builder().build());

    client.upload("tenant-1/pkg.zip", new byte[] {1}, "application/zip");

    verify(s3Client).copyObject(any(software.amazon.awssdk.services.s3.model.CopyObjectRequest.class));
  }
}
