package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Component
@RequiredArgsConstructor
public class AwsS3ObjectStorageClient implements ObjectStorageClient {

  private final SaasAppProperties saasAppProperties;
  private volatile S3Client s3Client;

  @Override
  public String upload(String objectKey, byte[] content, String contentType) {
    var storage = saasAppProperties.getObjectStorage();
    client()
        .putObject(
            PutObjectRequest.builder()
                .bucket(storage.getBucket())
                .key(objectKey)
                .contentType(contentType)
                .build(),
            RequestBody.fromBytes(content));
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
