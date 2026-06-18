package com.yunyan.saasapi.application.storage;

import com.yunyan.saasapi.config.SaasAppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class ObjectStorageClientFactory {

  private final SaasAppProperties saasAppProperties;
  private final LocalObjectStorageClient localObjectStorageClient;
  private final S3CompatibleObjectStorageClient s3CompatibleObjectStorageClient;

  public ObjectStorageClient client() {
    var provider = saasAppProperties.getObjectStorage().getProvider();
    if ("s3-compatible".equalsIgnoreCase(provider)
        && StringUtils.hasText(saasAppProperties.getObjectStorage().getEndpoint())) {
      return s3CompatibleObjectStorageClient;
    }
    return localObjectStorageClient;
  }
}
