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

  @Override
  public String upload(String objectKey, byte[] content, String contentType) {
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
    return localObjectStorageClient.exists(objectKey);
  }
}
