package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CompleteMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CompletedMultipartUpload;
import software.amazon.awssdk.services.s3.model.CompletedPart;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.UploadPartRequest;

@Component
@RequiredArgsConstructor
public class AwsS3ObjectStorageClient implements ObjectStorageClient {

  private final SaasAppProperties saasAppProperties;
  private final ObjectStorageLifecycleService lifecycleService;
  private volatile S3Client s3Client;

  @Override
  public String upload(String objectKey, byte[] content, String contentType) {
    var storage = saasAppProperties.getObjectStorage();
    if (content.length > storage.getMultipartThresholdBytes()) {
      return uploadLarge(objectKey, new java.io.ByteArrayInputStream(content), content.length, contentType);
    }
    client()
        .putObject(
            PutObjectRequest.builder()
                .bucket(storage.getBucket())
                .key(objectKey)
                .contentType(contentType)
                .build(),
            RequestBody.fromBytes(content));
    replicateIfConfigured(objectKey);
    lifecycleService.recordRetentionPolicy(objectKey);
    return resolvePublicUrl(objectKey);
  }

  @Override
  public String uploadLarge(String objectKey, InputStream content, long size, String contentType) {
    var storage = saasAppProperties.getObjectStorage();
    if (size <= storage.getMultipartThresholdBytes()) {
      try {
        return upload(objectKey, content.readAllBytes(), contentType);
      } catch (java.io.IOException ex) {
        throw new IllegalStateException("Failed to read upload stream: " + objectKey, ex);
      }
    }
    var create =
        client()
            .createMultipartUpload(
                CreateMultipartUploadRequest.builder()
                    .bucket(storage.getBucket())
                    .key(objectKey)
                    .contentType(contentType)
                    .build());
    var uploadId = create.uploadId();
    var partSize = 5L * 1024 * 1024;
    List<CompletedPart> parts = new ArrayList<>();
    var partNumber = 1;
    try {
      var buffer = new byte[(int) Math.min(partSize, Integer.MAX_VALUE)];
      int read;
      while ((read = content.read(buffer)) != -1) {
        var partBytes = read == buffer.length ? buffer : java.util.Arrays.copyOf(buffer, read);
        var etag =
            client()
                .uploadPart(
                    UploadPartRequest.builder()
                        .bucket(storage.getBucket())
                        .key(objectKey)
                        .uploadId(uploadId)
                        .partNumber(partNumber)
                        .build(),
                    RequestBody.fromBytes(partBytes))
                .eTag();
        parts.add(CompletedPart.builder().partNumber(partNumber).eTag(etag).build());
        partNumber++;
      }
      client()
          .completeMultipartUpload(
              CompleteMultipartUploadRequest.builder()
                  .bucket(storage.getBucket())
                  .key(objectKey)
                  .uploadId(uploadId)
                  .multipartUpload(CompletedMultipartUpload.builder().parts(parts).build())
                  .build());
      replicateIfConfigured(objectKey);
      lifecycleService.recordRetentionPolicy(objectKey);
      return resolvePublicUrl(objectKey);
    } catch (java.io.IOException ex) {
      throw new IllegalStateException("Multipart upload failed: " + objectKey, ex);
    }
  }

  private void replicateIfConfigured(String objectKey) {
    var storage = saasAppProperties.getObjectStorage();
    if (!StringUtils.hasText(storage.getReplicationTargetBucket())) {
      return;
    }
    client()
        .copyObject(
            CopyObjectRequest.builder()
                .sourceBucket(storage.getBucket())
                .sourceKey(objectKey)
                .destinationBucket(storage.getReplicationTargetBucket())
                .destinationKey(objectKey)
                .build());
  }

  private String resolvePublicUrl(String objectKey) {
    var storage = saasAppProperties.getObjectStorage();
    if (StringUtils.hasText(storage.getPublicBaseUrl())) {
      var base =
          storage.getPublicBaseUrl().endsWith("/")
              ? storage.getPublicBaseUrl().substring(0, storage.getPublicBaseUrl().length() - 1)
              : storage.getPublicBaseUrl();
      return base + "/" + objectKey;
    }
    return "s3://" + storage.getBucket() + "/" + objectKey;
  }

  @Override
  public boolean exists(String objectKey) {
    var storage = saasAppProperties.getObjectStorage();
    try {
      client().headObject(b -> b.bucket(storage.getBucket()).key(objectKey));
      return true;
    } catch (Exception ex) {
      return false;
    }
  }

  S3Client client() {
    if (s3Client == null) {
      synchronized (this) {
        if (s3Client == null) {
          s3Client = buildClient(saasAppProperties.getObjectStorage());
        }
      }
    }
    return s3Client;
  }

  void setS3Client(S3Client client) {
    this.s3Client = client;
  }

  private static S3Client buildClient(SaasAppProperties.ObjectStorage storage) {
    var builder =
        S3Client.builder()
            .region(Region.of(storage.getRegion()))
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(storage.getAccessKey(), storage.getSecretKey())));
    if (StringUtils.hasText(storage.getEndpoint())) {
      builder.endpointOverride(URI.create(storage.getEndpoint())).forcePathStyle(true);
    }
    return builder.build();
  }
}
