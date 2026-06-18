package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class S3CompatibleObjectStorageClient implements ObjectStorageClient {

  private final SaasAppProperties saasAppProperties;
  private final LocalObjectStorageClient localObjectStorageClient;
  private final AwsS3ObjectStorageClient awsS3ObjectStorageClient;

  @Override
  public String upload(String objectKey, byte[] content, String contentType) {
    if (useRealS3()) {
      return awsS3ObjectStorageClient.upload(objectKey, content, contentType);
    }
    var storage = saasAppProperties.getObjectStorage();
    var uploaded = localObjectStorageClient.upload(objectKey, content, contentType);
    if (StringUtils.hasText(storage.getPublicBaseUrl())) {
      var base =
          storage.getPublicBaseUrl().endsWith("/")
              ? storage.getPublicBaseUrl().substring(0, storage.getPublicBaseUrl().length() - 1)
              : storage.getPublicBaseUrl();
      return base + "/" + objectKey;
    }
    return uploaded;
  }

  @Override
  public boolean exists(String objectKey) {
    if (useRealS3()) {
      return awsS3ObjectStorageClient.exists(objectKey);
    }
    return localObjectStorageClient.exists(objectKey);
  }

  private boolean useRealS3() {
    var storage = saasAppProperties.getObjectStorage();
    return storage.isUseRealS3()
        && "s3-compatible".equalsIgnoreCase(storage.getProvider())
        && StringUtils.hasText(storage.getEndpoint());
  }
}
